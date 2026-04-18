from flask import Blueprint, request, jsonify
from middlewares.auth_middleware import token_required
from extensions import mongo
from datetime import datetime
from bson import ObjectId
import pickle
import pandas as pd
from routes.notification_routes import send_notification

performance_bp = Blueprint("performance", __name__)

# Subject name mapping from frontend to backend
SUBJECT_NAME_MAPPING = {
    'systems in mechanical engg': 'Systems in mechanical engg',
    'basic electrical engg': 'Basic electrical engg',
    'engineering physics': 'Engineering  Physics',
    'programming & problem solving': 'Programming & Problem solving',
    'engg mathematics - i': 'Engg Mathematics - I',
    'engineering mechanics': 'Engineering  Mechanics',
    'basic electronics engineering': 'Basic electronics engineering ',
    'engg chemistry': 'Engg Chemistry',
    'engg graphics': 'Engg Graphics',
    'engg mathematics ii': 'Engg Mathematics II',
    'fundamentals of programming languages': 'Fundamentals of Programming Languages\n(For 2024 Pattern only!)'
}

# Function to normalize subject names
def normalize_subject_name(subject):
    """Normalize subject name to match backend expected subjects"""
    normalized = subject.lower().strip()
    return SUBJECT_NAME_MAPPING.get(normalized, subject)

# -----------------------------
# SUBJECTS (FIXED ORDER)
# -----------------------------
EXPECTED_SUBJECTS = [
    'Systems in mechanical engg',
    'Basic electrical engg',
    'Engineering  Physics',
    'Programming & Problem solving',
    'Engg Mathematics - I',
    'Engineering  Mechanics',
    'Basic electronics engineering ',
    'Engg Chemistry',
    'Engg Graphics',
    'Engg Mathematics II',
    'Fundamentals of Programming Languages\n(For 2024 Pattern only!)'
]

# -----------------------------
# SUBJECT CATEGORIES
# -----------------------------
THEORY_SUBJECTS = [
    'Engineering  Physics',
    'Engg Chemistry',
    'Systems in mechanical engg',
    'Basic electronics engineering '
]

COMPUTATIONAL_SUBJECTS = [
    'Engg Mathematics - I',
    'Engg Mathematics II',
    'Programming & Problem solving',
    'Fundamentals of Programming Languages\n(For 2024 Pattern only!)',
    'Engineering  Mechanics'
]

# -----------------------------
# GRADE MAPPING
# -----------------------------
grade_map = {
    "O": 10, "A+": 9, "A": 8, "B+": 7,
    "B": 6, "C": 5, "D": 4, "P": 2, "F": 0
}

# SUBJECT ALIASES - map common subject names to EXPECTED_SUBJECTS
SUBJECT_ALIASES = {
    'mathematics': 'Engg Mathematics - I',
    'math': 'Engg Mathematics - I',
    'physics': 'Engineering  Physics',
    'chemistry': 'Engg Chemistry',
    'programming': 'Programming & Problem solving',
    'mechanics': 'Engineering  Mechanics',
    'electrical': 'Basic electrical engg',
    'electronics': 'Basic electronics engineering ',
    'graphics': 'Engg Graphics',
    'systems': 'Systems in mechanical engg',
}

def map_subject_name(subject_name):
    """
    Map a subject name to the EXPECTED_SUBJECTS list.
    Handles common variations and aliases.
    """
    if not subject_name:
        return None
    
    # Direct match
    if subject_name in EXPECTED_SUBJECTS:
        return subject_name
    
    # Case-insensitive direct match
    subject_lower = subject_name.lower().strip()
    for expected in EXPECTED_SUBJECTS:
        if expected.lower().strip() == subject_lower:
            return expected
    
    # Check aliases
    if subject_lower in SUBJECT_ALIASES:
        return SUBJECT_ALIASES[subject_lower]
    
    # Partial match (check if any keyword matches)
    for keyword, mapped_subject in SUBJECT_ALIASES.items():
        if keyword in subject_lower:
            return mapped_subject
    
    return None

# GRADE MAPPING
# ------------------------------

# -----------------------------
# LOAD MODEL
# -----------------------------
try:
    model = pickle.load(open("D:\\Edumate AI\\edumate-backend\\models\\model.pkl", "rb"))
    le = pickle.load(open("D:\\Edumate AI\\edumate-backend\\models\\le.pkl", "rb"))
    model_available = True
except Exception as e:
    print("Model load error:", str(e))
    model_available = False


# =====================================================
# SAVE MARKS + ANALYSIS
# =====================================================
@performance_bp.route("/marks", methods=["POST"])
@token_required
def save_marks():
    try:
        data = request.json or {}
        student_id = ObjectId(request.user["user_id"])

        marks_data = data.get("marks", [])

        if not marks_data:
            return jsonify({"message": "No marks data provided"}), 400

        subject_dict = {}

        # -----------------------------
        # VALIDATION
        # -----------------------------
        for mark in marks_data:
            subject = mark.get("subject")
            grade = mark.get("grade")

            if not subject or not grade:
                return jsonify({"message": "Subject and grade required"}), 400

            if grade not in grade_map:
                return jsonify({"message": f"Invalid grade: {grade}"}), 400

            # Normalize subject name to match backend expected subjects
            normalized_subject = normalize_subject_name(subject)
            
            # Warn if subject name was normalized (for debugging)
            if normalized_subject != subject:
                print(f"Subject name normalized: '{subject}' -> '{normalized_subject}'")
            
            subject_dict[normalized_subject] = grade_map[grade]

        # -----------------------------
        # BUILD FEATURE VECTOR (11)
        # -----------------------------
        numeric_grades = [
            subject_dict.get(sub, 0) for sub in EXPECTED_SUBJECTS
        ]

        # -----------------------------
        # ML PREDICTION
        # -----------------------------
        if model_available:
            try:
                X = pd.DataFrame([numeric_grades], columns=EXPECTED_SUBJECTS)
                prediction = model.predict(X)
                performance = le.inverse_transform(prediction)[0]
            except Exception as e:
                print("ML Error:", str(e))
                performance = "Unknown"
        else:
            performance = "Unavailable"

        # -----------------------------
        # ADVANCED ANALYSIS
        # -----------------------------
        weak_subjects = []
        strong_subjects = []

        for sub, score in zip(EXPECTED_SUBJECTS, numeric_grades):
            if score <= 5:
                weak_subjects.append(sub)
            elif score >= 8:
                strong_subjects.append(sub)

        theory_scores = [subject_dict.get(sub, 0) for sub in THEORY_SUBJECTS]
        comp_scores = [subject_dict.get(sub, 0) for sub in COMPUTATIONAL_SUBJECTS]

        theory_avg = sum(theory_scores) / len(THEORY_SUBJECTS)
        comp_avg = sum(comp_scores) / len(COMPUTATIONAL_SUBJECTS)

        # -----------------------------
        # BUILD ANALYSIS MESSAGE
        # -----------------------------
        analysis_parts = []

        analysis_map = {
            "Excellent": "Outstanding performance across subjects.",
            "Good": "Consistent and above average performance.",
            "Average": "You need improvement in some subjects.",
            "Poor": "Performance is weak and needs serious attention."
        }

        analysis_parts.append(analysis_map.get(performance, "Performance evaluated."))

        if weak_subjects:
            analysis_parts.append(f"Focus more on: {', '.join(weak_subjects)}.")

        if strong_subjects:
            analysis_parts.append(f"Your strengths: {', '.join(strong_subjects)}.")

        if theory_avg < comp_avg:
            analysis_parts.append(
                "Your theory subjects are weaker. Improve conceptual understanding and revision."
            )
        elif comp_avg < theory_avg:
            analysis_parts.append(
                "Your computational subjects are weaker. Improve problem-solving and logical thinking."
            )

        analysis = " ".join(analysis_parts)

        # -----------------------------
        # GPA + PERCENTAGE
        # -----------------------------
        gpa = sum(numeric_grades) / len(numeric_grades)
        percentage = (gpa / 10) * 100

        # -----------------------------
        # SAVE TO DB
        # -----------------------------
        mongo.db.marks.update_one(
            {"student_id": student_id},
            {
                "$set": {
                    "student_id": student_id,
                    "marks": marks_data,
                    "performance_level": performance,
                    "analysis": analysis,
                    "gpa": round(gpa, 2),
                    "percentage": round(percentage, 2),
                    "weak_subjects": weak_subjects,
                    "strong_subjects": strong_subjects,
                    "updated_at": datetime.utcnow()
                },
                "$setOnInsert": {
                    "created_at": datetime.utcnow()
                }
            },
            upsert=True
        )

        # ========================================
        # SEND PERFORMANCE NOTIFICATIONS
        # ========================================
        try:
            # Get user email and phone
            user = mongo.db.users.find_one({"_id": student_id})
            user_email = user.get("email", "") if user else ""
            user_phone = user.get("phone", "") if user else ""

            # Alert for poor performance
            if performance in ["Poor", "Average"]:
                send_notification(
                    user_id=str(student_id),
                    title="Performance Alert",
                    message=f"Your performance level is {performance}. Please review the analysis and focus on weak subjects.",
                    alert_type="PERFORMANCE",
                    user_email=user_email,
                    user_phone=user_phone
                )

            # Alert for weak subjects
            if weak_subjects:
                weak_subject_list = ", ".join(weak_subjects[:3])
                send_notification(
                    user_id=str(student_id),
                    title="Weak Subject Alert",
                    message=f"You have weak performance in: {weak_subject_list}. Focus on improving these subjects.",
                    alert_type="WEAK_SUBJECT",
                    user_email=user_email,
                    user_phone=user_phone
                )

            # Info notification for good performance
            if performance == "Excellent":
                send_notification(
                    user_id=str(student_id),
                    title="Excellent Performance!",
                    message="Congratulations! You have excellent performance. Keep up the good work!",
                    alert_type="GENERAL",
                    user_email=user_email,
                    user_phone=user_phone
                )

        except Exception as notif_error:
            print(f"Notification error: {str(notif_error)}")
            # Don't fail the request if notification fails

        return jsonify({
            "message": "Marks saved successfully",
            "performance": performance,
            "analysis": analysis,
            "gpa": round(gpa, 2),
            "percentage": round(percentage, 2)
        }), 200

    except Exception as e:
        return jsonify({"message": f"Error saving marks: {str(e)}"}), 500


# =====================================================
# GET MARKS
# =====================================================
@performance_bp.route("/marks", methods=["GET"])
@token_required
def get_marks():
    try:
        student_id = ObjectId(request.user["user_id"])
        record = mongo.db.marks.find_one({"student_id": student_id})

        if not record:
            return jsonify({"message": "No marks found"}), 404

        return jsonify({
            "marks": record.get("marks", []),
            "performance_level": record.get("performance_level"),
            "analysis": record.get("analysis"),
            "gpa": record.get("gpa"),
            "percentage": record.get("percentage"),
            "updated_at": record.get("updated_at").isoformat() if record.get("updated_at") else None
        }), 200

    except Exception as e:
        return jsonify({"message": f"Error retrieving marks: {str(e)}"}), 500


# =====================================================
# ANALYTICS + DASHBOARD DATA
# =====================================================
@performance_bp.route("/analytics", methods=["GET"])
@token_required
def get_analytics():
    """
    Get comprehensive analytics for dashboard visualization
    Includes charts data, comparisons, and insights
    """
    try:
        student_id = ObjectId(request.user["user_id"])
        record = mongo.db.marks.find_one({"student_id": student_id})

        if not record:
            return jsonify({"message": "No performance data found"}), 404

        marks_data = record.get("marks", [])
        
        # Build subject-grade mapping
        subject_grades = {}
        for mark in marks_data:
            subject_grades[mark["subject"]] = grade_map.get(mark["grade"], 0)

        # Get numeric grades in order
        numeric_grades = [
            subject_grades.get(sub, 0) for sub in EXPECTED_SUBJECTS
        ]

        # Calculate subject categories performance
        theory_scores = [subject_grades.get(sub, 0) for sub in THEORY_SUBJECTS]
        comp_scores = [subject_grades.get(sub, 0) for sub in COMPUTATIONAL_SUBJECTS]

        theory_avg = sum(theory_scores) / len(THEORY_SUBJECTS) if THEORY_SUBJECTS else 0
        comp_avg = sum(comp_scores) / len(COMPUTATIONAL_SUBJECTS) if COMPUTATIONAL_SUBJECTS else 0

        # Identify weak and strong subjects
        weak_subjects = []
        strong_subjects = []
        for sub, score in zip(EXPECTED_SUBJECTS, numeric_grades):
            if score <= 5:
                weak_subjects.append({"subject": sub, "grade": score})
            elif score >= 8:
                strong_subjects.append({"subject": sub, "grade": score})

        # Prepare chart data
        chart_data = []
        for subject, grade in zip(EXPECTED_SUBJECTS, numeric_grades):
            chart_data.append({
                "subject": subject.strip()[:25],  # Truncate for display
                "grade": grade,
                "fullSubject": subject
            })

        category_comparison = [
            {"category": "Theory Subjects", "average": round(theory_avg, 2)},
            {"category": "Computational", "average": round(comp_avg, 2)}
        ]

        return jsonify({
            "success": True,
            "performance_level": record.get("performance_level"),
            "analysis": record.get("analysis"),
            "gpa": record.get("gpa"),
            "percentage": record.get("percentage"),
            "updated_at": record.get("updated_at").isoformat() if record.get("updated_at") else None,
            
            # Chart data
            "chartData": chart_data,
            "categoryComparison": category_comparison,
            
            # Analytics
            "weakSubjects": weak_subjects,
            "strongSubjects": strong_subjects,
            "theoryAverage": round(theory_avg, 2),
            "compAverage": round(comp_avg, 2),
            
            # Summary stats
            "totalSubjects": len(marks_data),
            "excellentCount": len([g for g in numeric_grades if g >= 9]),
            "goodCount": len([g for g in numeric_grades if 7 <= g < 9]),
            "averageCount": len([g for g in numeric_grades if 5 <= g < 7]),
            "poorCount": len([g for g in numeric_grades if g < 5])
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": f"Error retrieving analytics: {str(e)}"}), 500
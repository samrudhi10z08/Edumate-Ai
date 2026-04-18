from flask import Blueprint, jsonify, request, current_app
from middlewares.auth_middleware import token_required
from datetime import datetime
from bson.objectid import ObjectId

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/dashboard", methods=["GET"])
@token_required
def dashboard():
    return jsonify({
        "message": "Welcome to dashboard",
        "user": request.user
    })


@dashboard_bp.route("/save-marks", methods=["POST"])
@token_required
def save_marks():
    """
    Save student marks/grades to marksheet collection
    Expected JSON:
    {
        "marks": [
            {"subject": "Math", "grade": "A+", "marks": 85},
            {"subject": "English", "grade": "O", "marks": 95}
        ]
    }
    """
    try:
        data = request.get_json() or {}
        marks_list = data.get("marks", [])
        
        # Extract user_id from decoded token
        user_id_str = request.user.get("user_id") if isinstance(request.user, dict) else request.user
        
        try:
            student_id = ObjectId(user_id_str)
        except:
            return jsonify({"success": False, "error": "Invalid user ID"}), 400
        
        if not marks_list:
            return jsonify({"success": False, "error": "No marks provided"}), 400
        
        # Validate marks data
        for mark in marks_list:
            if not mark.get("subject") or not mark.get("grade"):
                return jsonify({
                    "success": False, 
                    "error": "Each mark must have subject and grade"
                }), 400
        
        # Get collections
        users = current_app.mongo.db.users
        marksheet = current_app.mongo.db.marksheet
        
        # Verify user exists and get user info
        user = users.find_one({"_id": student_id})
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        # Get branch - must be one of the valid enum values
        valid_branches = ['Computer', 'IT', 'Electronics & Telecommunication', 'Mechanical']
        branch = user.get("branch", "IT")
        
        # If branch is not valid, default to IT
        if branch not in valid_branches:
            branch = "IT"
        
        # Prepare document for marksheet collection (matching schema)
        marksheet_doc = {
            "student_id": str(student_id),  # Must be string
            "student_name": user.get("name", ""),
            "student_email": user.get("email", ""),
            "branch": branch,  # Required field
            "marks": marks_list,  # Array of marks
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Delete old marks for this student and insert new one
        marksheet.delete_many({"student_id": str(student_id)})
        result = marksheet.insert_one(marksheet_doc)
        
        # Also update user document with latest marks
        users.update_one(
            {"_id": student_id},
            {
                "$set": {
                    "marks": marks_list,
                    "marks_updated_at": datetime.utcnow()
                }
            }
        )
        
        return jsonify({
            "success": True,
            "message": "Marks saved successfully",
            "marks_count": len(marks_list),
            "inserted_id": str(result.inserted_id)
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error saving marks: {str(e)}"
        }), 500


@dashboard_bp.route("/get-marks", methods=["GET"])
@token_required
def get_marks():
    """
    Get saved marks for the authenticated student from marksheet collection
    """
    try:
        # Extract user_id from decoded token
        user_id_str = request.user.get("user_id") if isinstance(request.user, dict) else request.user
        
        try:
            student_id = ObjectId(user_id_str)
        except:
            return jsonify({"success": False, "error": "Invalid user ID"}), 400
        
        marksheet = current_app.mongo.db.marksheet
        
        # Find marks document for this student
        mark_doc = marksheet.find_one({"student_id": str(student_id)})
        
        if not mark_doc:
            return jsonify({
                "success": True,
                "marks": [],
                "total_subjects": 0
            }), 200
        
        marks = mark_doc.get("marks", [])
        
        return jsonify({
            "success": True,
            "marks": marks,
            "total_subjects": len(marks)
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error fetching marks: {str(e)}"
        }), 500


@dashboard_bp.route("/analytics", methods=["GET"])
@token_required
def get_analytics():
    """
    Get comprehensive dashboard analytics for a student
    Returns all data needed for the dashboard visualization
    """
    try:
        # Extract user_id from decoded token
        user_id_str = request.user.get("user_id") if isinstance(request.user, dict) else request.user
        
        try:
            student_id = ObjectId(user_id_str)
        except:
            return jsonify({"success": False, "error": "Invalid user ID"}), 400
        
        users = current_app.mongo.db.users
        
        user = users.find_one({"_id": student_id})
        
        if not user:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        # Extract marks data from marksheet collection
        marksheet = current_app.mongo.db.marksheet
        mark_doc = marksheet.find_one({"student_id": str(student_id)})
        
        marks_data = []
        if mark_doc:
            marks_list = mark_doc.get("marks", [])
            marks_data = [
                {
                    "subject": mark.get("subject", "Unknown"),
                    "marks": mark.get("marks", 0),
                    "grade": mark.get("grade", ""),
                    "avg": 75  # Placeholder, update if you have this data
                }
                for mark in marks_list
            ]
        
        # Generate sample data (replace with actual ML/analysis results)
        attendance_trend = [
            {"month": "Jan", "attendance": 82},
            {"month": "Feb", "attendance": 79},
            {"month": "Mar", "attendance": 75},
            {"month": "Apr", "attendance": 73},
            {"month": "May", "attendance": 68},
            {"month": "Jun", "attendance": 70},
        ]
        
        stress_factors = [
            {"factor": "Academic Workload", "value": 30},
            {"factor": "Exam Anxiety", "value": 22},
            {"factor": "Poor Sleep", "value": 18},
            {"factor": "Time Management", "value": 16},
            {"factor": "Concentration", "value": 14},
        ]
        
        study_plan = [
            {"day": "Mon", "hours": 3.5},
            {"day": "Tue", "hours": 2.5},
            {"day": "Wed", "hours": 4},
            {"day": "Thu", "hours": 3},
            {"day": "Fri", "hours": 3.5},
            {"day": "Sat", "hours": 5},
            {"day": "Sun", "hours": 2},
        ]
        
        class_overview = [
            {"label": "High Stress", "students": 53},
            {"label": "Moderate", "students": 51},
            {"label": "Low", "students": 51},
        ]
        
        recent_reports = [
            {"id": 1, "title": "Performance Analysis Report", "date": "2026-03-20", "format": "PDF"},
            {"id": 2, "title": "Stress Assessment Summary", "date": "2026-03-20", "format": "CSV"},
            {"id": 3, "title": "Study Plan Recommendation", "date": "2026-03-20", "format": "PDF"},
        ]
        
        weak_subjects = user.get("weak_subjects", [])
        recommendations = user.get("recommendations", [
            "Revise weak subjects regularly",
            "Maintain consistent study schedule",
            "Take breaks every 45 minutes",
            "Focus on understanding concepts"
        ])
        
        return jsonify({
            "success": True,
            "student_name": user.get("name", "Student"),
            "branch": user.get("branch", "Not Specified"),
            "semester": user.get("semester", "Not Specified"),
            "performance": user.get("performance_status", "Normal"),
            "stress": user.get("stress_level", "Medium"),
            "attendance": user.get("attendance", 68),
            "cgpa": user.get("cgpa", 0),
            "predicted_score": user.get("predicted_score", 72),
            "risk_score": user.get("risk_score", 50),
            "weak_subjects": weak_subjects,
            "recommendations": recommendations,
            "marks": marks_data,
            "attendance_trend": attendance_trend,
            "stress_factors": stress_factors,
            "study_plan": study_plan,
            "class_overview": class_overview,
            "recent_reports": recent_reports
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Error fetching analytics: {str(e)}"
        }), 500

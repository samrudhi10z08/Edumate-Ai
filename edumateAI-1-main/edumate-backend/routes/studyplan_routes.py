from flask import Blueprint, request, jsonify
from middlewares.auth_middleware import token_required
from extensions import mongo
from bson import ObjectId
from models.study_analysis_model import StudyAnalysisModel
from datetime import datetime

studyplan_bp = Blueprint("studyplan", __name__)

@studyplan_bp.route("/generate", methods=["POST"])
@token_required
def generate_study_plan():
    """Generate personalized study plan based on performance and stress data"""
    try:
        student_id = ObjectId(request.user["user_id"])
        
        # Get performance data
        marks_record = mongo.db.marks.find_one({"student_id": student_id})
        if not marks_record:
            return jsonify({"message": "No performance data found. Please upload marks first."}), 400
        
        # Get stress data
        stress_record = mongo.db.stress_records.find_one(
            {"student_id": student_id},
            sort=[("timestamp", -1)]
        )
        stress_level = stress_record.get("stress_level", "medium") if stress_record else "medium"
        
        # Get user data
        user = mongo.db.users.find_one({"_id": student_id})
        
        # Extract weak and strong subjects
        weak_subjects = marks_record.get("weak_subjects", []) if "weak_subjects" in marks_record else []
        strong_subjects = marks_record.get("strong_subjects", []) if "strong_subjects" in marks_record else []
        
        # Prepare performance data for model
        performance_data = {
            "gpa": marks_record.get("gpa", 0),
            "percentage": marks_record.get("percentage", 0),
            "performance_level": marks_record.get("performance_level", "Unknown")
        }
        
        # Initialize study analysis model
        analyzer = StudyAnalysisModel(
            performance_data=performance_data,
            stress_level=stress_level,
            weak_subjects=weak_subjects,
            strong_subjects=strong_subjects
        )
        
        # Generate comprehensive study plan
        recommendations = analyzer.get_detailed_recommendations()
        
        # Extract study plan and profile
        study_plan_data = recommendations.get("study_plan", {})
        student_profile = recommendations.get("student_profile", {})
        
        # DEBUG: Log what we're saving
        print(f"DEBUG - Study plan keys: {study_plan_data.keys() if isinstance(study_plan_data, dict) else 'Not a dict'}")
        print(f"DEBUG - Profile keys: {student_profile.keys() if isinstance(student_profile, dict) else 'Not a dict'}")
        print(f"DEBUG - Overview: {study_plan_data.get('overview', 'NOT FOUND') if isinstance(study_plan_data, dict) else 'N/A'}")
        
        # Save study plan to database
        plan_document = {
            "student_id": student_id,
            "study_plan": study_plan_data,
            "student_profile": student_profile,
            "generated_at": datetime.utcnow().isoformat(),
            "student_name": user.get("name", "Student") if user else "Student",
            "performance_level": performance_data["performance_level"],
            "stress_level": stress_level
        }
        
        mongo.db.study_plans.update_one(
            {"student_id": student_id},
            {"$set": plan_document},
            upsert=True
        )
        
        return jsonify({
            "success": True,
            "message": "Study plan generated successfully",
            "study_plan": plan_document
        }), 200
        
    except Exception as e:
        print(f"Study plan generation error: {str(e)}")
        return jsonify({"message": f"Error generating study plan: {str(e)}"}), 500


@studyplan_bp.route("/get", methods=["GET"])
@token_required
def get_study_plan():
    """Get existing study plan for student"""
    try:
        student_id = ObjectId(request.user["user_id"])
        
        study_plan = mongo.db.study_plans.find_one({"student_id": student_id})
        
        if not study_plan:
            return jsonify({
                "success": False,
                "message": "No study plan found. Generate one first.",
                "plan": None
            }), 404
        
        # Remove MongoDB _id for cleaner response
        study_plan.pop("_id", None)
        
        return jsonify({
            "success": True,
            "message": "Study plan retrieved successfully",
            "study_plan": study_plan
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Error retrieving study plan: {str(e)}"}), 500


@studyplan_bp.route("/summary", methods=["GET"])
@token_required
def get_summary():
    """Get quick summary of study plan"""
    try:
        student_id = ObjectId(request.user["user_id"])
        
        study_plan = mongo.db.study_plans.find_one({"student_id": student_id})
        
        if not study_plan:
            return jsonify({
                "success": False,
                "message": "No study plan found"
            }), 404
        
        plan_data = study_plan.get("plan", {})
        overview = plan_data.get("study_plan", {}).get("overview", {})
        weak_plan = plan_data.get("study_plan", {}).get("weak_subject_plan", {})
        stress_mgmt = plan_data.get("study_plan", {}).get("stress_management", {})
        
        summary = {
            "performance_overview": overview,
            "weak_subjects": weak_plan.get("subjects", []) if weak_plan.get("subjects") else "No weak subjects",
            "stress_level": stress_mgmt.get("current_stress_level", "UNKNOWN"),
            "immediate_actions": stress_mgmt.get("immediate_actions", []),
            "this_week_focus": "See detailed plan for complete schedule",
            "next_checkpoint": "End of Week 1 - Target: 40-50%"
        }
        
        return jsonify({
            "success": True,
            "summary": summary
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500


@studyplan_bp.route("/export-pdf", methods=["GET"])
@token_required
def export_study_plan_pdf():
    """Export study plan as PDF"""
    try:
        student_id = ObjectId(request.user["user_id"])
        
        study_plan = mongo.db.study_plans.find_one({"student_id": student_id})
        
        if not study_plan:
            return jsonify({"message": "No study plan found"}), 404
        
        # In production, use reportlab or weasyprint to generate PDF
        # For now, return JSON
        return jsonify({
            "success": True,
            "message": "PDF generation initiated",
            "note": "PDF export coming soon",
            "data": study_plan.get("plan")
        }), 200
        
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500

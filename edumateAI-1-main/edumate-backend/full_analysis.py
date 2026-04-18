import sys
sys.path.insert(0, '.')
from extensions import mongo
from flask import Flask
from config import Config
from bson import ObjectId

app = Flask(__name__)
app.config.from_object(Config)
mongo.init_app(app)

with app.app_context():
    print("=" * 70)
    print("COMPLETE DATA FLOW ANALYSIS")
    print("=" * 70)
    
    user_id = ObjectId("69e2772c709a225e5316e89c")
    
    # Get the marks collection to see all fields
    marks = mongo.db.marks.find_one({"student_id": user_id})
    if marks:
        print("\n=== RAW MARKS DOCUMENT ===")
        for key, value in marks.items():
            if key != "_id":
                if key == "marks":
                    print(f"{key}: {value[:3]}..." if isinstance(value, list) and len(value) > 3 else f"{key}: {value}")
                else:
                    print(f"{key}: {value}")
    
    # Get stress data for this user
    stress = mongo.db.stress_records.find_one({"student_id": user_id}, sort=[("timestamp", -1)])
    print("\n=== STRESS RECORD (should exist) ===")
    if stress:
        print("✓ Found")
        print(f"  - stress_level: {stress.get('stress_level')}")
        print(f"  - timestamp: {stress.get('timestamp')}")
    else:
        print("✗ Not found - study plan will use default 'medium'")
    
    # Get study plan
    study_plan = mongo.db.study_plans.find_one({"student_id": user_id})
    if study_plan:
        print("\n=== STUDY PLAN ===")
        print(f"Generated at: {study_plan.get('generated_at')}")
        print(f"Stress Level Used: {study_plan.get('stress_level')}")
        
        profile = study_plan.get('student_profile', {})
        print("\nStudent Profile in Study Plan:")
        print(f"  - current_performance: {profile.get('current_performance')}")
        print(f"  - performance_level: {profile.get('performance_level')}")
        print(f"  - stress_status: {profile.get('stress_status')}")
        print(f"  - weak_subjects_count: {profile.get('weak_subjects_count')}")
        
        sp = study_plan.get('study_plan', {})
        overview = sp.get('overview', {})
        print("\nStudy Plan Overview:")
        print(f"  - focus_area: {overview.get('focus_area')}")
        print(f"  - overall_strategy: {overview.get('overall_strategy')}")

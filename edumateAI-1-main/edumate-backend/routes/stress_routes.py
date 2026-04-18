from datetime import datetime
from bson import ObjectId
from flask import Blueprint, request, jsonify
import pickle
import numpy as np
import os
from dotenv import load_dotenv
from extensions import mongo   #  correct usage
from routes.notification_routes import send_notification

load_dotenv()

stress_bp = Blueprint("stress", __name__)

# Load model
model = pickle.load(open("models/stress_model.pkl", "rb"))
le = pickle.load(open("models/label_encoder.pkl", "rb"))

# OpenAI client - optional
try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as e:
    print("Warning: OpenAI client not available:", str(e))
    client = None


@stress_bp.route("/predict", methods=["POST"])
def predict_stress():

    data = request.json or {}
    answers = data.get("answers")
    student_id = data.get("student_id")

    # 🔹 Validation
    if not answers:
        return jsonify({"error": "No answers provided"}), 400

    if len(answers) != 20:
        return jsonify({"error": "20 answers required"}), 400

    #  Ensure numeric input
    try:
        answers = [float(x) for x in answers]
    except:
        return jsonify({"error": "Answers must be numeric"}), 400

    if not student_id:
        return jsonify({"error": "student_id required"}), 400

    if not ObjectId.is_valid(student_id):
        return jsonify({"error": "Invalid student_id"}), 400

    try:
        # 🔹 ML Prediction
        features = np.array(answers).reshape(1, -1)
        prediction = model.predict(features)
        stress_level = le.inverse_transform(prediction)[0].lower()

        # 🔹 Factor detection
        factors = []

        if answers[0] >= 4:
            factors.append("academic workload")
        if answers[1] >= 4:
            factors.append("lack of concentration")
        if answers[2] >= 4:
            factors.append("exam anxiety")
        if answers[5] >= 4:
            factors.append("poor time management")
        if answers[8] == 1:
            factors.append("sleep issues")
        if answers[13] == 1:
            factors.append("irritability")
        if answers[15] <= 2:
            factors.append("low confidence")
        if answers[16] <= 2:
            factors.append("lack of support")
        if answers[17] <= 2:
            factors.append("difficulty managing stress")

        if not factors:
            factors.append("general academic pressure")

        # 🔹 Prompt
        prompt = f"""
A student has a stress level of {stress_level}.
The main factors affecting them are: {', '.join(factors)}.

Explain:
- why the student might be stressed
- what these factors mean
- practical suggestions to improve

Keep it simple and student-friendly.
"""

        # 🔹 AI Analysis
        analysis = None

        if client:
            try:
                ai_response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[{"role": "user", "content": prompt}]
                )
                analysis = ai_response.choices[0].message.content

            except Exception as ai_error:
                print("AI Error:", str(ai_error))

        # 🔹 Fallback (ONLY if AI fails)
        if not analysis:
            if stress_level == "low":
                analysis = """
Your stress level is low. You are managing your academic and personal life well.
Continue maintaining a balanced routine and stay consistent with your habits.
"""
            elif stress_level == "medium":
                analysis = f"""
Your stress level is moderate. Factors like {', '.join(factors)} may be affecting you.
Focus on better time management, proper sleep, and regular breaks.
"""
            else:
                analysis = f"""
Your stress level is high due to {', '.join(factors)}.
You should take immediate steps like organizing tasks, improving sleep, and seeking support.
"""

        # 🔹 Save to MongoDB
        record = {
            "student_id": ObjectId(student_id),
            "timestamp": datetime.utcnow(),
            "stress_level": stress_level,
            "analysis": analysis
        }

        result = mongo.db.stress_records.insert_one(record)  

        # ========================================
        # SEND STRESS NOTIFICATIONS
        # ========================================
        try:
            # Get user email and phone
            user = mongo.db.users.find_one({"_id": ObjectId(student_id)})
            user_email = user.get("email", "") if user else ""
            user_phone = user.get("phone", "") if user else ""

            # Alert for high/critical stress
            if stress_level in ["high", "critical"]:
                send_notification(
                    user_id=student_id,
                    title="High Stress Level Detected",
                    message=f"Your stress level is {stress_level.upper()}. Please take breaks, practice relaxation techniques, and reach out for support if needed.",
                    alert_type="STRESS",
                    user_email=user_email,
                    user_phone=user_phone
                )
            
            # Info notification for low stress
            elif stress_level == "low":
                send_notification(
                    user_id=student_id,
                    title="Good Stress Levels",
                    message="Your stress levels are healthy. Keep maintaining your balance!",
                    alert_type="GENERAL",
                    user_email=user_email,
                    user_phone=user_phone
                )

        except Exception as notif_error:
            print(f"Notification error: {str(notif_error)}")
            # Don't fail the request if notification fails

        return jsonify({
            "stress_level": stress_level,
            "analysis": analysis,
            "record_id": str(result.inserted_id)
        })

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500
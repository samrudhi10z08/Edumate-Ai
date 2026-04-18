from flask import Blueprint, request, jsonify, current_app
from flask_mail import Mail, Message
from flask_cors import cross_origin
from datetime import datetime
from middlewares.auth_middleware import token_required
from extensions import mongo
from bson.objectid import ObjectId
import logging

notification_bp = Blueprint("notification", __name__)
logger = logging.getLogger(__name__)

# Alert type constants
ALERT_TYPES = {
    "ATTENDANCE": "Low Attendance Alert",
    "PERFORMANCE": "Performance Warning",
    "STRESS": "High Stress Alert",
    "STUDY_PLAN": "Study Plan Ready",
    "EXAM": "Exam Reminder",
    "WEAK_SUBJECT": "Weak Subject Alert",
    "GENERAL": "Important Update"
}


# =====================================================
# NOTIFICATION UTILITIES
# =====================================================

def save_notification_to_db(user_id, title, message, alert_type, channel, status="SENT"):
    """Save notification to MongoDB"""
    try:
        notification = {
            "user_id": ObjectId(user_id),
            "title": title,
            "message": message,
            "type": alert_type,
            "channel": channel,
            "status": status,
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        result = mongo.db.notifications.insert_one(notification)
        notification["_id"] = str(result.inserted_id)
        notification["user_id"] = str(user_id)
        return notification
    except Exception as e:
        logger.error(f"Database notification save error: {e}")
        return None


def send_email_alert(to_email, title, message, alert_type="GENERAL"):
    """Send email notification"""
    try:
        # Check if Flask-Mail is configured
        mail = current_app.extensions.get('mail')
        if not mail:
            logger.warning("Flask-Mail not configured")
            return {"success": False, "error": "Email service not available"}

        if not to_email:
            return {"success": False, "error": "Email address not available"}

        # Format email body
        email_body = f"""
Dear Student,

{message}

Alert Type: {ALERT_TYPES.get(alert_type, alert_type)}
Sent at: {datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")}

---
EduMate AI - Your Academic Companion
Please login to your dashboard for more details.
"""

        msg = Message(
            subject=title,
            recipients=[to_email],
            body=email_body
        )

        with current_app.app_context():
            mail.send(msg)

        logger.info(f"Email sent successfully to {to_email}")
        return {"success": True}

    except Exception as e:
        logger.error(f"Email sending error: {e}")
        return {"success": False, "error": str(e)}


def send_sms_alert(mobile_no, message, alert_type="GENERAL"):
    """Send SMS notification via Twilio (if configured)"""
    try:
        # Get Twilio config
        account_sid = current_app.config.get("TWILIO_ACCOUNT_SID")
        auth_token = current_app.config.get("TWILIO_AUTH_TOKEN")
        twilio_phone = current_app.config.get("TWILIO_PHONE_NUMBER")

        if not all([account_sid, auth_token, twilio_phone]):
            logger.warning("Twilio not configured - SMS skipped")
            return {"success": False, "error": "SMS service not available"}

        if not mobile_no:
            return {"success": False, "error": "Mobile number not available"}

        # Send SMS via Twilio
        from twilio.rest import Client
        client = Client(account_sid, auth_token)
        
        sms = client.messages.create(
            body=message,
            from_=twilio_phone,
            to=mobile_no
        )

        logger.info(f"SMS sent to {mobile_no} (SID: {sms.sid})")
        return {"success": True, "message": f"SMS sent successfully (SID: {sms.sid})"}

    except Exception as e:
        logger.error(f"SMS sending error: {e}")
        return {"success": False, "error": str(e)}


def send_notification(user_id, title, message, alert_type="GENERAL", user_email=None, user_phone=None):
    """Send notification to all channels"""
    results = {}

    # 1. Save in-app notification
    try:
        in_app = save_notification_to_db(user_id, title, message, alert_type, "IN_APP", "SENT")
        results["in_app"] = {"success": in_app is not None}
    except Exception as e:
        logger.error(f"In-app notification error: {e}")
        results["in_app"] = {"success": False, "error": str(e)}

    # 2. Send email
    if user_email:
        try:
            email_result = send_email_alert(user_email, title, message, alert_type)
            if email_result["success"]:
                save_notification_to_db(user_id, title, message, alert_type, "EMAIL", "SENT")
            else:
                save_notification_to_db(user_id, title, message, alert_type, "EMAIL", "FAILED")
            results["email"] = email_result
        except Exception as e:
            logger.error(f"Email sending error: {e}")
            results["email"] = {"success": False, "error": str(e)}

    # 3. Send SMS
    if user_phone:
        try:
            sms_result = send_sms_alert(user_phone, message, alert_type)
            if sms_result["success"]:
                save_notification_to_db(user_id, title, message, alert_type, "SMS", "SENT")
            else:
                save_notification_to_db(user_id, title, message, alert_type, "SMS", "FAILED")
            results["sms"] = sms_result
        except Exception as e:
            logger.error(f"SMS sending error: {e}")
            results["sms"] = {"success": False, "error": str(e)}

    return results


# =====================================================
# ROUTES
# =====================================================

@notification_bp.route("/status", methods=["GET"])
@cross_origin()
def check_status():
    """Check notification service status"""
    mail_available = current_app.extensions.get('mail') is not None
    twilio_configured = all([
        current_app.config.get("TWILIO_ACCOUNT_SID"),
        current_app.config.get("TWILIO_AUTH_TOKEN")
    ])

    return jsonify({
        "success": True,
        "email_available": mail_available,
        "sms_available": twilio_configured,
        "message": "Notification service status check"
    }), 200


@notification_bp.route("/get-notifications", methods=["GET"])
@cross_origin()
@token_required
def get_notifications():
    """Get all notifications for authenticated user"""
    try:
        user_id = ObjectId(request.user.get("user_id"))

        notifications = list(mongo.db.notifications.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(50))

        # Convert ObjectId to string for JSON serialization
        for notif in notifications:
            notif["_id"] = str(notif["_id"])
            notif["user_id"] = str(notif["user_id"])
            notif["created_at"] = notif["created_at"].isoformat()

        return jsonify({
            "success": True,
            "notifications": notifications,
            "count": len(notifications)
        }), 200

    except Exception as e:
        logger.error(f"Get notifications error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@notification_bp.route("/mark-as-read/<notif_id>", methods=["PUT"])
@cross_origin()
@token_required
def mark_as_read(notif_id):
    """Mark a notification as read"""
    try:
        result = mongo.db.notifications.update_one(
            {"_id": ObjectId(notif_id), "user_id": ObjectId(request.user.get("user_id"))},
            {"$set": {"is_read": True}}
        )

        if result.matched_count == 0:
            return jsonify({"success": False, "error": "Notification not found"}), 404

        return jsonify({
            "success": True,
            "message": "Notification marked as read"
        }), 200

    except Exception as e:
        logger.error(f"Mark as read error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@notification_bp.route("/delete/<notif_id>", methods=["DELETE"])
@cross_origin()
@token_required
def delete_notification(notif_id):
    """Delete a notification"""
    try:
        result = mongo.db.notifications.delete_one(
            {"_id": ObjectId(notif_id), "user_id": ObjectId(request.user.get("user_id"))}
        )

        if result.deleted_count == 0:
            return jsonify({"success": False, "error": "Notification not found"}), 404

        return jsonify({
            "success": True,
            "message": "Notification deleted"
        }), 200

    except Exception as e:
        logger.error(f"Delete notification error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@notification_bp.route("/send-test", methods=["POST"])
@cross_origin()
@token_required
def send_test_notification():
    """Send a test notification (for testing purposes)"""
    try:
        user_id = request.user.get("user_id")
        data = request.get_json() or {}

        title = data.get("title", "Test Notification")
        message = data.get("message", "This is a test notification from EduMate AI")
        alert_type = data.get("type", "GENERAL")
        user_email = data.get("email")
        user_phone = data.get("phone")

        results = send_notification(user_id, title, message, alert_type, user_email, user_phone)

        return jsonify({
            "success": True,
            "message": "Test notification sent",
            "results": results
        }), 200

    except Exception as e:
        logger.error(f"Send test notification error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@notification_bp.route("/analyze-and-alert", methods=["POST"])
@cross_origin()
@token_required
def analyze_and_send_alerts():
    """
    Analyze performance/stress/attendance and send alerts accordingly
    
    Expected input:
    {
        "attendance": 68,
        "stress_level": "HIGH",
        "performance_status": "AT_RISK",
        "weak_subjects": ["Engg Chemistry", "Fundamentals"],
        "email": "student@example.com",
        "phone": "+919876543210"
    }
    """
    try:
        user_id = request.user.get("user_id")
        data = request.get_json() or {}

        attendance = data.get("attendance")
        stress_level = data.get("stress_level")
        performance_status = data.get("performance_status")
        weak_subjects = data.get("weak_subjects", [])
        user_email = data.get("email")
        user_phone = data.get("phone")

        sent_alerts = []

        # Attendance Alert
        if attendance is not None and attendance < 75:
            title = "Low Attendance Alert ⚠️"
            message = (
                f"Your attendance is {attendance}%, which is below the required 75%. "
                "Please improve your class attendance to avoid academic risk."
            )
            result = send_notification(user_id, title, message, "ATTENDANCE", user_email, user_phone)
            sent_alerts.append({"alert": "Attendance", "result": result})

        # Stress Alert
        if stress_level and stress_level.upper() in ["HIGH", "CRITICAL"]:
            title = "High Stress Alert 😟"
            message = (
                "Your stress level is high. Please take regular breaks, manage your workload, "
                "follow your study plan, and seek support from your counselor if needed."
            )
            result = send_notification(user_id, title, message, "STRESS", user_email, user_phone)
            sent_alerts.append({"alert": "Stress", "result": result})

        # Performance Alert
        if performance_status and performance_status.upper() == "AT_RISK":
            title = "Performance Warning ⚠️"
            message = (
                "Your academic performance indicates that you are at risk. "
                "Please focus on weak subjects and follow your personalized study plan."
            )
            result = send_notification(user_id, title, message, "PERFORMANCE", user_email, user_phone)
            sent_alerts.append({"alert": "Performance", "result": result})

        # Weak Subject Alert
        if weak_subjects:
            weak_list = ", ".join(weak_subjects[:3])  # Top 3 weak subjects
            title = "Weak Subject Alert 📚"
            message = (
                f"You have low scores in: {weak_list}. "
                "Consider focusing more on these subjects with targeted study sessions."
            )
            result = send_notification(user_id, title, message, "WEAK_SUBJECT", user_email, user_phone)
            sent_alerts.append({"alert": "Weak Subjects", "result": result})

        return jsonify({
            "success": True,
            "message": f"Analysis completed - {len(sent_alerts)} alert(s) triggered",
            "alerts_sent": sent_alerts
        }), 200

    except Exception as e:
        logger.error(f"Analyze and alert error: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

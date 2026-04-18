from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
import numpy as np
import jwt
from datetime import datetime, timedelta
from extensions import mongo

from utils.face_utils import get_face_embedding  

face_bp = Blueprint("face", __name__)

# ===================== REGISTER =====================
@face_bp.route("/register", methods=["POST"])
@cross_origin()
def face_register():
    data = request.json or {}
    email = data.get("email")
    image = data.get("image")

    if not email or not image:
        return jsonify({"message": "Email and image required"}), 400

    embedding = get_face_embedding(image)
    if embedding is None:
        return jsonify({"message": "No face detected"}), 400

    users = mongo.db.users

    result = users.update_one(
        {"email": email},
        {
            "$set": {
                "face_embedding": embedding.tolist(),
                "face_registered": True
            }
        }
    )

    if result.matched_count == 0:
        return jsonify({"message": "User not found. Please sign up first."}), 404

    return jsonify({"message": "Face registered successfully"}), 200



# ===================== LOGIN =====================
@face_bp.route("/login", methods=["POST"])
@cross_origin()
def face_login():
    image = request.json.get("image")

    embedding = get_face_embedding(image)
    if embedding is None:
        return jsonify({"message": "No face detected"}), 400

    print("LOGIN embedding shape:", embedding.shape)

    users = mongo.db.users

    for user in users.find({"face_embedding": {"$exists": True}}):
        stored = np.array(user["face_embedding"])
        print("Stored embedding shape:", stored.shape)

        distance = np.linalg.norm(stored - embedding)
        print("Distance:", distance)

        if distance < 1.3:
            token = jwt.encode(
                {
                    "email": user["email"],
                    "exp": datetime.utcnow() + timedelta(hours=1)
                },
                current_app.config["SECRET_KEY"],
                algorithm="HS256"
            )

            return jsonify({
                "token": token,
                "user": {
                    "_id": str(user["_id"]),  
                    "email": user["email"],
                    "name": user.get("name", "")
                }
            }), 200

    return jsonify({"message": "Face not recognized"}), 401


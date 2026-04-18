from flask import Blueprint, request, jsonify, current_app
from models.user_model import hash_password, check_password
from utils.jwt_utils import generate_token
from extensions import mongo

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    face_enabled = data.get("enableFace", False)

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    users =mongo.db.users

    if users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    users.insert_one({
        "name": name,
        "email": email,
        "password": hash_password(password),  
        "face_enabled": face_enabled,
        "face_registered": False,
        "face_embedding": []
    })

    return jsonify({"message": "Registration successful"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json or {}

    email = data.get("email")
    password = data.get("password")
    
    users = mongo.db.users
    user = users.find_one({"email": email})

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password(password, user["password"]):
        return jsonify({"message": "Invalid credentials"}), 401

    token = generate_token(user["_id"], user["email"])

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
             "_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    }), 200

from functools import wraps
from flask import request, jsonify
from utils.jwt_utils import decode_token

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")

        if not token:
            return jsonify({"message": "Token missing"}), 401

        try:
            token = token.split(" ")[1]
            data = decode_token(token)
            request.user = data
        except Exception:
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated

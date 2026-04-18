import jwt
from datetime import datetime, timedelta
from flask import current_app

def generate_token(user_id, email):
    payload = {
        "user_id": str(user_id),
        "email": email,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }

    token = jwt.encode(payload, current_app.config["JWT_SECRET"], algorithm="HS256")
    return token


def decode_token(token):
    return jwt.decode(token, current_app.config["JWT_SECRET"], algorithms=["HS256"])

import jwt

SECRET_KEY = "Secret_key_genration_for_password"
ALGORITHM = "HS256"

def generate_token(payload: dict) -> str:
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
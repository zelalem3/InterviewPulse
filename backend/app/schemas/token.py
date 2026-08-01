import jwt

SECRET_KEY = "Secret_key_genration_for_password"
ALGORITHM = "HS256"

def generate_token(payload: dict) -> str:
    # PyJWT's jwt.encode returns a string directly in modern versions
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
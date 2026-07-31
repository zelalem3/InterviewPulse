import bcrypt

def hash_password(password: str) -> str:
    # Hash a password and return it as a string for DB storage
    pwd_bytes = password.encode('utf-8')
    hashed = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())
    return hashed.decode('utf-8')


def verify_hash(plain_password: str, hashed_password: str) -> bool:
    # Convert plain password to bytes
    password_bytes = plain_password.encode('utf-8')
    
    # Ensure database hash is bytes
    if isinstance(hashed_password, str):
        hashed_bytes = hashed_password.encode('utf-8')
    else:
        hashed_bytes = hashed_password
        
    if bcrypt.checkpw(password_bytes, hashed_bytes):
        print("It Matches!")
        return True
    else:
        print("It Does not Match :(")   
        return False
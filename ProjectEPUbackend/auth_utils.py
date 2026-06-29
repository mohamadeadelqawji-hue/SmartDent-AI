import bcrypt
from datetime import datetime, timedelta
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

# --- إعدادات الحماية الأساسية ---
SECRET_KEY = "YOUR_SUPER_SECRET_KEY"  # يمكنك تغييره لنص عشوائي طويل
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # صلاحية المفتاح 8 ساعات

# تعريف نظام التعرف على التوكن (ليظهر زر Authorize في Swagger)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- دوال التشفير والتحقق ---

def hash_password(password: str):
    """تشفير كلمة المرور"""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(pwd_bytes, salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    """التحقق من مطابقة كلمة السر المدخلة مع المشفرة"""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False

def create_access_token(data: dict):
    """إنشاء التوكن (مفتاح الدخول)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# --- دوال التحقق من الصلاحيات (Guards) ---

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """دالة تجلب بيانات المستخدم من التوكن وتتأكد أنه صالح"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
        return {"username": username, "role": role}
    except JWTError:
        raise credentials_exception

def role_doctor_required(current_user: dict = Depends(get_current_user)):
    """حارس يمنع أي شخص غير الطبيب من الدخول"""
    if current_user["role"] != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to Doctors only"
        )
    return current_user

def role_secretary_required(current_user: dict = Depends(get_current_user)):
    """حارس يسمح للطبيب والسكرتير بالدخول"""
    if current_user["role"] not in ["doctor", "secretary"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation restricted to Staff only"
        )
    return current_user
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from data_admin import Admin, engine
from auth_utils import verify_password, create_access_token

auth_router = APIRouter(tags=["Authentication"])

@auth_router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    with Session(engine) as session:
        # البحث عن المستخدم في قاعدة البيانات
        statement = select(Admin).where(Admin.username == form_data.username)
        admin = session.exec(statement).first()
        
        # التحقق من وجود المستخدم وصحة كلمة السر (المشفرة)
        if not admin or not verify_password(form_data.password, admin.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_01_UNAUTHORIZED,
                detail="اسم المستخدم أو كلمة المرور غير صحيحة",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # إنشاء التوكن وإضافة الصلاحية (Role) داخل البيانات
        access_token = create_access_token(
            data={"sub": admin.username, "role": admin.role}
        )
        
        return {
            "access_token": access_token, 
            "token_type": "bearer", 
            "role": admin.role  # نرسل الدور للمتصفح ليعرف ماذا يظهر للمستخدم
        }
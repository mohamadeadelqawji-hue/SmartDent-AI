from fastapi import FastAPI
from patienttooth import pattienttooth
from users import router
from visite import router_visite
from fastapi.middleware.cors import CORSMiddleware # أضف هذا
from fastapi.staticfiles import StaticFiles # استيراد المكتبة
from prediction import router_prediction
from dashboard import router_dashboard
from auth_router import auth_router  # ملف تسجيل الدخول
from data_admin import create_initial_admins, create_admin_tables # ملف قاعدة بيانات المسؤولين

app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(auth_router)
app.include_router(router)
app.include_router(router_visite);
app.include_router(router_prediction)
app.include_router(pattienttooth)
app.include_router(router_dashboard)

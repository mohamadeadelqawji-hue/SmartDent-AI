
from fastapi import APIRouter ,Depends
from data_time import get_today_appointments_optimized
from auth_utils import role_secretary_required
router_dashboard=APIRouter(tags=["Dashboard"]);




@router_dashboard.get("/dashboard")
def get_all_user_visite_the_day(admin:dict=Depends(role_secretary_required)):
  return get_today_appointments_optimized()

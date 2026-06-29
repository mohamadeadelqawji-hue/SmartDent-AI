from fastapi import APIRouter,Depends,HTTPException
from data_user import get_detailed_patient_report
from data_visite import creat_table,getallvisite,get_all_visite_to_user,get_all_images_to_visite,delete_all_images_to_visite_and_ill
from auth_utils import role_secretary_required,role_doctor_required

from pydantic import BaseModel

class VisiteUpdate(BaseModel):
    data_time: str | None = None

# استيراد الدالة من ملف الداتا الخاص بالزيارات
from data_visite import update_visite_data

router_visite=APIRouter( tags=["Visits Management"]);

@router_visite.get("/visite_all_visite_all_Users")
async def get_allvisite(admin:dict=Depends(role_secretary_required)):
          return getallvisite()
@router_visite.get("/get_all_visites_to_user/{id}")
def get_all_visite_to_user_fast_api(id:int,admin:dict=Depends(role_secretary_required)):
   return get_all_visite_to_user(id_user=id)
@router_visite.get("/get_all_images_to_visite/{id_visite}")
def get_all_images_to_visitet_fast_api(id_visite:int,admin:dict=Depends(role_doctor_required)):
 return get_all_images_to_visite(id_visite);

@router_visite.get("/get_all_ill_User_from_Visites_and_Images/{id_user}")
def get_all_ill_User_from_Visites_and_Images(id_user:int,admin:dict=Depends(role_doctor_required)):

  return  get_detailed_patient_report(id_user=id_user)
@router_visite.put("/visite/{id}")
async def update_visite(id: int, visite_data: VisiteUpdate, admin: dict = Depends(role_secretary_required)):
    # جلب الحقول الممررة فعلياً
    update_dict = visite_data.model_dump(exclude_unset=True)
    
    if not update_dict:
        raise HTTPException(status_code=400, detail="لم يتم تعديل التاريخ أو الوقت")
        
    # استدعاء دالة التحديث
    updated_visite = update_visite_data(visite_id=id, update_data=update_dict)
    
    if not updated_visite:
        raise HTTPException(status_code=404, detail="الزيارة المطلوبة غير موجودة")
        
    return {
        "status": "success",
        "message": "تم تحديث وقت الزيارة بنجاح وحماية معرف المريض من التعديل",
        "visite": {
            "id": updated_visite.id,
            "data_time": updated_visite.data_time,
            "user_id": updated_visite.user_id # سيعود كما هو مخزن مسبقاً دون تغيير
        }
    }
    
    
    
    

@router_visite.delete("/get_all_images_to_visite_and_ill_ID/{id_visite}")
def get_all_images_to_visite_ID(id_visite:int,admin:dict=Depends(role_doctor_required)):
  return delete_all_images_to_visite_and_ill(id_visite)   

@router_visite.post("/visite")
async def visite(data_time:str,user_id:int|None):
  return creat_table(data_time,user_id)
  
@router_visite.delete("/visite/{id}")
def delete_visite(id:int,admin:dict=Depends(role_doctor_required)):
  return True

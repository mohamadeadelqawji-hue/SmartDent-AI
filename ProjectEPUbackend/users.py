from fastapi import APIRouter,Depends
from pydantic import BaseModel,Field
from sqlalchemy.sql.functions import user;
from data_user import creat_table,getall_users,getone_user,delete_user,delete_user_and_visite_and_image_and_ill_full_delete
from relshinship import creatrelshinship
from auth_utils import oauth2_scheme, role_doctor_required,role_secretary_required
from data_user import update_user_data
router=APIRouter( tags=["Users Management"]);
class Users(BaseModel):

  name:str
  age:int
  phone:str

class UserUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    phone: str | None = None
    
    
    
    
@router.get("/users")
async def get_data(admin:dict=Depends(role_secretary_required)):
  return getall_users()


@router.get("/users/{id}")
async def get_data_one(id:int,admin:dict=Depends(role_secretary_required)):
  user=getone_user(id=id)
  return user

@router.post("/users")
async def add_users(users:Users,admin:dict=Depends(role_secretary_required))->Users:
  creat_table(x=users.name,y=users.age,phone=users.phone)
  return users
@router.put("/users/{id}")
async def update_patient(id: int, user_data: UserUpdate, admin: dict = Depends(role_secretary_required)):
    # exclude_unset=True تعني: جلب الحقول التي قام المستخدم بكتابتها وتعديلها في الفورم فقط
    # وتجاهل أي حقول لم يتم إرسالها أو بقيت على حالها الافتراضي
    update_dict = user_data.model_dump(exclude_unset=True)
    
    # إذا لم يقم السكرتير بتغيير أي شيء وأرسل طلب فارغ
    if not update_dict:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="لم يتم تعديل أي حقول")
        
    updated_user = update_user_data(user_id=id, update_data=update_dict)
    
    if not updated_user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="المريض غير موجود")
        
    return {
        "status": "success",
        "message": "تم تحديث البيانات المحددة بنجاح والحفاظ على بقية الحقول القديمة",
        "user": {
            "id": updated_user.id,
            "name": updated_user.name,
            "age": updated_user.age,
            "phone": updated_user.phone
        }
    }

@router.delete("/users/{id}")
async def delete_users(id:int,admin: dict = Depends(role_doctor_required)):
  
  return delete_user_and_visite_and_image_and_ill_full_delete(id_user=id)


@router.get("/users&visite")
async def get_user_visite(admin:dict=Depends(role_secretary_required)):
  data = creatrelshinship()
  return data
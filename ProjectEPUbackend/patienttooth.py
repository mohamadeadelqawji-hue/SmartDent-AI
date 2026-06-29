from fastapi import APIRouter,Depends
from data_patienttooth import get_all_diseases_from_pictures,delet_patienttooth
from auth_utils import role_doctor_required
pattienttooth=APIRouter(tags=["PatientTooth"]);
@pattienttooth.get("/pattienttooth/{id_image}")
async def get_all_ills_teeth(id_image:int,admin:dict=Depends(role_doctor_required)):
  return get_all_diseases_from_pictures(id_image=id_image);

@pattienttooth.delete("/pattienttooth/{id_ill}")
async def delet_ill(id_ill:int,admin:dict=Depends(role_doctor_required)):
  return delet_patienttooth(id=id_ill);
  

from sqlalchemy import ReturnsRows
from sqlmodel import Session,select,create_engine,SQLModel,Field
from data_image import DentalImage
import json
class PatientTooth(SQLModel,table=True):
  id:int|None=Field(default=None,primary_key=True)
  finding_type:str
  tooth_name:str
  tooth_bbox:str
  defect_bbox:str
  image_id:int=Field(foreign_key="dentalimage.id");

sqlite_url='postgresql://postgres:0945180265Adel@localhost:5432/QuizApplicationYT'
enginer=create_engine(sqlite_url);
def creat_table_db():
  SQLModel.metadata.create_all(enginer);

def creat_table_pattienttooth(image_id: int, model_result: list):
    with Session(enginer) as session:
        for result in model_result:
            # التأكد أن العنصر يحتوي فعلاً على 4 قيم قبل تفكيكه
            if len(result) != 4:
                continue 
                
            finding, tooth, t_bbox, d_bbox = result
            
            new_finding = PatientTooth(
                finding_type=finding,
                tooth_name=tooth if tooth else "Unknown",
                tooth_bbox=json.dumps(t_bbox),
                defect_bbox=json.dumps(d_bbox) if d_bbox else None,
                image_id=image_id
            )
            session.add(new_finding)
        session.commit()
def delet_patienttooth(id:int):
  with Session(enginer) as session:
    data=select(PatientTooth).where(PatientTooth.id==id)
    result=session.exec(data).one();
    session.delete(result);
    session.commit();
def get_all_diseases_from_pictures(id_image:int):
  with Session(enginer) as session:
   data=select(PatientTooth).where(PatientTooth.image_id==id_image)
   result=session.exec(data).all();
   return result;
# model_output = [('Caries', 'First Molar (36)', (85, 85, 113, 118), (89, 88, 111, 116))]  
if __name__=="__main__":
  print("ddd")
  # creat_table(image_id=4,model_result=model_output)
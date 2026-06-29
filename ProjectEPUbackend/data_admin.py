from sqlmodel import SQLModel, Field, create_engine, Session, select
from auth_utils import hash_password

class Admin(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True)
    hashed_password: str
    role: str # 'doctor' أو 'secretary'

sqlite_url = 'postgresql://postgres:0945180265Adel@localhost:5432/QuizApplicationYT'
engine = create_engine(sqlite_url)

def create_admin_tables():
    SQLModel.metadata.create_all(engine)

# دالة لإنشاء مستخدم أول مرة (Seed Data)
def create_initial_admins():
    with Session(engine) as session:
        # فحص إذا كان الجدول فارغاً
        if not session.exec(select(Admin)).first():
            dr = Admin(username="doctorAhmade", hashed_password=hash_password("dr123456"), role="doctor")
            sec = Admin(username="Mohmade", hashed_password=hash_password("sec123456"), role="secretary")
            session.add_all([dr, sec])
            session.commit()
if __name__=="__main__":
  create_admin_tables();
  # create_initial_admins();
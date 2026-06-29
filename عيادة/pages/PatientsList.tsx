import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Patient } from '../types';
import Toast from '../components/Toast';

const PatientsList: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // حالات المودال الخاص بالإصدار والإضافة والحذف
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  
  // --- الحالات الجديدة الخاصة بالتعديل ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [editForm, setEditForm] = useState({ name: '', age: '', phone: '' });

  const [newPatient, setNewPatient] = useState({ name: '', age: '', phone: '' });

  const API_URL = 'http://127.0.0.1:8000/users';

  // الحصول على التوكن من التخزين المحلي
  const token = localStorage.getItem('token'); 
  const userRole = localStorage.getItem('role'); 
  const isDoctor = userRole === 'doctor';
  const isSecretary = userRole === 'secretary';

  // إعداد الـ Headers باستخدام التوكن الحقيقي
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // جلب جميع المرضى
  const fetchPatients = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(API_URL, getAuthConfig());
      setPatients(response.data);
    } catch (error: any) {
      console.error(error);
      setToast({ message: 'حدث خطأ أثناء جلب بيانات المرضى', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // دالة تصفية البحث
  const filteredPatients = useMemo(() => {
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery)
    );
  }, [patients, searchQuery]);

  // إضافة مريض جديد
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, {
        name: newPatient.name,
        age: parseInt(newPatient.age),
        phone: newPatient.phone
      }, getAuthConfig());

      setToast({ message: 'تم إضافة المريض بنجاح', type: 'success' });
      setIsAddModalOpen(false);
      setNewPatient({ name: '', age: '', phone: '' });
      fetchPatients();
    } catch (error) {
      setToast({ message: 'فشلت عملية إضافة المريض', type: 'error' });
    }
  };

  // حذوفات المريض
  const confirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await axios.delete(`${API_URL}/${patientToDelete.id}`, getAuthConfig());
      setToast({ message: `تم حذف المريض ${patientToDelete.name} بنجاح`, type: 'success' });
      setPatientToDelete(null);
      fetchPatients();
    } catch (error) {
      setToast({ message: 'لا تملك الصلاحية لحذف مريض أو حدث خطأ بالسيرفر', type: 'error' });
      setPatientToDelete(null);
    }
  };

  // --- دوال التعديل الجديدة ---
  const handleEditClick = (patient: Patient) => {
    setPatientToEdit(patient);
    setEditForm({
      name: patient.name,
      age: patient.age.toString(),
      phone: patient.phone
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientToEdit) return;

    try {
      // إرسال البيانات المحدثة للباك إيند بنفس الهيكلية المتوقعة
      await axios.put(`${API_URL}/${patientToEdit.id}`, {
        name: editForm.name,
        age: parseInt(editForm.age),
        phone: editForm.phone
      }, getAuthConfig());

      setToast({ message: 'تم تحديث بيانات المريض بنجاح', type: 'success' });
      setIsEditModalOpen(false);
      setPatientToEdit(null);
      fetchPatients(); // إعادة تحميل الجدول ليعكس التعديلات فوراً
    } catch (error) {
      setToast({ message: 'فشلت عملية تحديث بيانات المريض', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-sans" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* الرأس والبحث */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-deep-teal mb-2">سجلات المرضى</h1>
          <p className="text-slate-500 font-bold text-sm">إدارة وتتبع ملفات المرضى والزيارات الدورية للعيادة.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-deep-teal text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all w-full sm:w-auto justify-center"
        >
          <span className="material-symbols-outlined">person_add</span>
          <span>إضافة مريض جديد</span>
        </button>
      </div>

      {/* صندوق البحث */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex items-center gap-3">
        <span className="material-symbols-outlined text-slate-400 mr-2">search</span>
        <input 
          type="text"
          placeholder="ابحث عن مريض بالاسم أو رقم الهاتف..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-slate-700 placeholder-slate-400 font-bold text-sm outline-none bg-transparent"
        />
      </div>

      {/* جدول عرض البيانات */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-black text-sm">
                <th className="p-5">رقم الملف</th>
                <th className="p-5">الاسم الكامل</th>
                <th className="p-5">العمر</th>
                <th className="p-5">رقم الهاتف</th>
                <th className="p-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-bold text-slate-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400">جاري تحميل البيانات...</td>
                </tr>
              ) : filteredPatients.length > 0 ? (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 text-slate-400 font-mono">#{patient.id}</td>
                    <td className="p-5 text-deep-teal font-black text-base">{patient.name}</td>
                    <td className="p-5">{patient.age} سنة</td>
                    <td className="p-5 font-mono text-slate-500">{patient.phone}</td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        {/* زر عرض الملف الطبي */}
                        <button 
                          onClick={() => navigate(`/patients/${patient.id}`)}
                          className="p-2.5 rounded-xl hover:bg-blue-50 text-blue-600 transition-colors flex items-center"
                          title="عرض الملف الطبي"
                        >
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        
                        {/* زر التعديل الجديد - يظهر للجميع */}
                        <button 
                          onClick={() => handleEditClick(patient)}
                          className="p-2.5 rounded-xl hover:bg-amber-50 text-amber-600 transition-colors flex items-center"
                          title="تعديل بيانات المريض"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>

                        {/* زر الحذف - يظهر فقط للدكتور لحماية البيانات */}
                        {isDoctor && (
                          <button 
                            onClick={() => setPatientToDelete(patient)}
                            className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors flex items-center"
                            title="حذف المريض"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-400 italic">لا يوجد مرضى يطابقون بحثك.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- 1. مودال إضافة مريض جديد --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-deep-teal mb-2">إضافة ملف مريض جديد</h3>
            <p className="text-slate-400 font-bold text-sm mb-6">الرجاء إدخال البيانات الأساسية بدقة لإنشاء السجل الطبي.</p>
            
            <form onSubmit={handleAddPatient} className="space-y-5">
              <div>
                <label className="text-slate-600 font-black text-xs block mb-2 mr-1">الاسم الكامل</label>
                <input type="text" required value={newPatient.name} onChange={(e) => setNewPatient({...newPatient, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold transition-all" placeholder="محمد أحمد..." />
              </div>
              <div className="grid grid-columns-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 font-black text-xs block mb-2 mr-1">العمر</label>
                  <input type="number" required value={newPatient.age} onChange={(e) => setNewPatient({...newPatient, age: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold transition-all" placeholder="25" min="1" max="120" />
                </div>
                <div>
                  <label className="text-slate-600 font-black text-xs block mb-2 mr-1">رقم الهاتف</label>
                  <input type="tel" required value={newPatient.phone} onChange={(e) => setNewPatient({...newPatient, phone: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold transition-all text-left font-mono" placeholder="09xxxxxxxx" />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">حفظ البيانات</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 2. مودال تعديل بيانات المريض الجديد --- */}
      {isEditModalOpen && patientToEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-deep-teal mb-2">تعديل بيانات المريض</h3>
            <p className="text-slate-400 font-bold text-sm mb-6">تعديل السجل الحالي لـ: <span className="text-primary">{patientToEdit.name}</span></p>
            
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div>
                <label className="text-slate-600 font-black text-xs block mb-2 mr-1">الاسم الكامل</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold transition-all" 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600 font-black text-xs block mb-2 mr-1">العمر</label>
                  <input 
                    type="number" 
                    required 
                    value={editForm.age} 
                    onChange={(e) => setEditForm({...editForm, age: e.target.value})} 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold transition-all" 
                    min="1" 
                    max="120" 
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-black text-xs block mb-2 mr-1">رقم الهاتف</label>
                  <input 
                    type="tel" 
                    required 
                    value={editForm.phone} 
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})} 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold transition-all text-left font-mono" 
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-2xl font-bold hover:shadow-lg transition-all">تحديث وتعديل</button>
                <button type="button" onClick={() => { setIsEditModalOpen(false); setPatientToEdit(null); }} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 3. مودال تأكيد الحذف --- */}
      {patientToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            
            <p className="text-slate-500 mb-6">هل أنت متأكد من حذف المريض <br/> <b>{patientToDelete.name}</b>؟</p>
            <div className="flex gap-4">
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold">نعم</button>
              <button onClick={() => setPatientToDelete(null)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsList;
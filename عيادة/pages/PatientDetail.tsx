import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
// استيراد لوحة تحكم تحليل الذكاء الاصطناعي التي قمنا ببنائها معاً
import PatientHealthDashboard from './PatientProgress'; 

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- حالات البيانات (States) ---
  const [patient, setPatient] = useState<any>(null);
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);

  // --- حالات التحكم بالواجهة ---
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [showAiDashboard, setShowAiDashboard] = useState(false); // حالة التحكم بفتح وإغلاق لوحة تحليل الذكاء الاصطناعي
  const [newVisitDate, setNewVisitDate] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- الحالات المضافة للتعديل السطري ---
  const [visitToEditId, setVisitToEditId] = useState<number | null>(null);
  const [editVisitDate, setEditVisitDate] = useState('');

  // --- الحصول على التوكن من localStorage ---
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  const isDoctor = userRole === 'doctor';
  
  console.log("userRole is Doctor: ", isDoctor);

  // دالة التعديل السطري المربوطة بالـ API
  const handleEditVisitSubmit = async (visitId: number) => {
    if (!editVisitDate) return;
    try {
      const authConfig = { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
          'Content-Type': 'application/json'
        } 
      };
      await axios.put(`http://127.0.0.1:8000/visite/${visitId}`, { data_time: editVisitDate }, authConfig);
      
      setToast({ message: 'تم تحديث تاريخ الزيارة بنجاح', type: 'success' });
      setVisitToEditId(null); // إغلاق وضع التعديل
      fetchData(); // إعادة جلب البيانات لتحديث الجدول بنفس دالتك الأصلية
    } catch (error) {
      setToast({ message: 'فشلت عملية تعديل تاريخ الزيارة', type: 'error' });
    }
  };

  // 1. جلب البيانات باستخدام التوكن في الـ Headers
  const fetchData = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [userRes, visitsRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/users/${id}`, config),
        axios.get(`http://127.0.0.1:8000/get_all_visites_to_user/${id}`, config)
      ]);
      
      setPatient(userRes.data);
      setAllVisits(visitsRes.data);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      if (error.response?.status === 401) {
        navigate('/login'); // توجيه لتسجيل الدخول إذا انتهت الصلاحية
      } else {
        setToast({ 
          message: error.response?.status === 404 ? 'لم يتم العثور على المسار الصحيح بالسيرفر' : 'خطأ في جلب البيانات', 
          type: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchData();
    } else if (!token) {
      navigate('/login');
    }
  }, [id, token]);

  // 2. ترتيب الزيارات (الأحدث أولاً)
  const patientVisits = useMemo(() => {
    return [...allVisits].sort((a, b) => new Date(b.data_time).getTime() - new Date(a.data_time).getTime());
  }, [allVisits]);

  // 3. إضافة زيارة جديدة مع التوكن
  const handleAddVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVisitDate) return;

    try {
      const formattedDate = newVisitDate.replace(/-/g, '/');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.post(`http://127.0.0.1:8000/visite?data_time=${formattedDate}&user_id=${id}`, {}, config);
      
      setToast({ message: 'تمت إضافة موعد الزيارة بنجاح', type: 'success' });
      setShowAddVisit(false);
      setNewVisitDate('');
      fetchData(); 
    } catch (error: any) {
      setToast({ message: 'فشل في إضافة الموعد، حاول مرة أخرى', type: 'error' });
    }
  };

  // 4. دالة الحذف الشامل للزيارة مع التوكن
  const confirmDeleteVisit = async () => {
    if (!selectedVisitId) return;
    try {
      setDeleteLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.delete(`http://127.0.0.1:8000/get_all_images_to_visite_and_ill_ID/${selectedVisitId}`, config);
      
      setToast({ message: 'تم حذف الزيارة وجميع بياناتها بنجاح', type: 'success' });
      fetchData(); 
    } catch (error: any) {
      console.error("Delete Error:", error.response);
      setToast({ message: 'حدث خطأ أثناء محاولة الحذف، تأكد من اتصال السيرفر', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedVisitId(null);
    }
  };

  if (loading && !patient) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-primary text-xl">جاري تحميل بيانات المريض...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-20 p-4" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteVisit}
        loading={deleteLoading}
        title="حذف سجل الزيارة"
        message="هل أنت متأكد من حذف هذه الزيارة؟ سيتم حذف جميع الصور والبيانات المرتبطة بها نهائياً."
      />

      {/* Header Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8 transition-all hover:shadow-md">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 w-full xl:w-auto">
            <div className="relative flex-shrink-0">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${patient?.name}`} 
                  className="w-24 h-24 rounded-2xl bg-slate-100 shadow-inner border-2 border-white" 
                  alt="Avatar" 
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-deep-teal leading-tight">{patient?.name}</h1>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-sm">العمر: {patient?.age} سنة</span>
                <span className="text-primary font-bold bg-primary/5 px-3 py-1 rounded-lg border border-primary/10 text-sm">معرف المريض: #{id}</span>
                {patient?.phone && (
                  <span className="text-slate-500 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 text-sm">الهاتف: {patient.phone}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* قسم الأزرار المحدث لإضافة زر تحليل الذكاء الاصطناعي */}
          <div className="flex flex-wrap gap-3 w-full xl:w-auto">
            {isDoctor && (
              <button 
                onClick={() => setShowAiDashboard(true)}
                className="flex-1 md:flex-none bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
              >
                <span className="material-symbols-outlined">psychology</span>
                تحليل الذكاء الاصطناعي 🧠
              </button>
            )}
            
            <button 
              onClick={() => setShowAddVisit(true)}
              className="flex-1 md:flex-none bg-primary text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-deep-teal transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <span className="material-symbols-outlined">calendar_add_on</span>
              إضافة موعد جديد
            </button>
            
            <button 
              onClick={() => navigate(-1)} 
              className="flex-1 md:flex-none px-6 py-4 border-2 border-slate-100 rounded-2xl font-bold hover:bg-slate-50 text-slate-600 transition-colors"
            >
                رجوع
            </button>
          </div>
        </div>
      </div>

      {/* Visits Table Section */}
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
              <h3 className="text-xl font-bold text-deep-teal flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary bg-white p-2 rounded-xl shadow-sm">history</span>
                  سجل الزيارات الطبي
              </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-5 text-sm font-bold text-slate-500 border-b">رقم الزيارة</th>
                  <th className="p-5 text-sm font-bold text-slate-500 border-b">التاريخ والوقت</th>
                  <th className="p-5 text-sm font-bold text-slate-500 border-b">الحالة</th>
                  {isDoctor && (<th className="p-5 text-sm font-bold text-slate-500 border-b text-center">الإجراءات</th>)}
                </tr>
              </thead>
              <tbody>
                {patientVisits.map((visit: any) => (
                  <tr key={visit.id} className="hover:bg-blue-50/30 transition-all border-b border-slate-50 last:border-0 group">
                    <td className="p-5 text-sm font-bold text-slate-600">#{visit.id}</td>
                    
                    {/* عمود التاريخ والوقت مع ميزة التعديل السطري */}
                    <td className="p-5 font-bold text-deep-teal">
                      {visitToEditId === visit.id ? (
                        <input 
                          type="date"
                          value={editVisitDate}
                          onChange={(e) => setEditVisitDate(e.target.value)}
                          className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-bold text-left text-sm"
                        />
                      ) : (
                        visit.data_time
                      )}
                    </td>

                    <td className="p-5">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        مكتملة
                      </span>
                    </td>
                    {isDoctor && (
                      <td className="p-5 text-center flex items-center justify-center gap-3">
                        {visitToEditId === visit.id ? (
                          <>
                            {/* أزرار الحفظ والإلغاء أثناء التعديل النشط */}
                            <button 
                              onClick={() => handleEditVisitSubmit(visit.id)}
                              className="bg-white border-2 border-slate-100 text-emerald-600 hover:border-emerald-600 hover:bg-emerald-600 hover:text-white p-2.5 rounded-xl transition-all active:scale-90"
                              title="حفظ التعديل"
                            >
                              <span className="material-symbols-outlined">check_circle</span>
                            </button>
                            <button 
                              onClick={() => setVisitToEditId(null)}
                              className="bg-white border-2 border-slate-100 text-slate-400 hover:border-slate-400 hover:bg-slate-400 hover:text-white p-2.5 rounded-xl transition-all active:scale-90"
                              title="إلغاء"
                            >
                              <span className="material-symbols-outlined">cancel</span>
                            </button>
                          </>
                        ) : (
                          <>
                            {/* زر العرض الأصلي */}
                            <button 
                              onClick={() => navigate(`/patients/${id}/visite/${visit.id}`)}
                              className="bg-white border-2 border-slate-100 text-primary hover:border-primary hover:bg-primary hover:text-white p-2.5 rounded-xl transition-all active:scale-90"
                              title="عرض التفاصيل"
                            >
                                <span className="material-symbols-outlined">visibility</span>
                            </button>
                            
                            {/* زر التعديل السطري المضاف حديثاً */}
                            <button 
                              onClick={() => {
                                setVisitToEditId(visit.id);
                                setEditVisitDate(visit.data_time); 
                              }}
                              className="bg-white border-2 border-slate-100 text-amber-500 hover:border-amber-500 hover:bg-amber-500 hover:text-white p-2.5 rounded-xl transition-all active:scale-90"
                              title="تعديل تاريخ الزيارة"
                            >
                                <span className="material-symbols-outlined">edit_calendar</span>
                            </button>

                            {/* زر الحذف الأصلي */}
                            <button 
                              onClick={() => {
                                setSelectedVisitId(visit.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="bg-white border-2 border-slate-100 text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition-all active:scale-90"
                              title="حذف"
                            >
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
                {patientVisits.length === 0 && (
                  <tr>
                    <td colSpan={isDoctor ? 4 : 3} className="p-20 text-center text-slate-300 font-medium">
                        لا توجد زيارات سابقة مسجلة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Visit Modal */}
      {showAddVisit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-deep-teal mb-6">تحديد موعد جديد</h2>
            <form onSubmit={handleAddVisit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-3 text-slate-600">اختر تاريخ الزيارة</label>
                <input 
                  type="date" 
                  required 
                  className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 outline-none focus:border-primary font-bold text-deep-teal" 
                  onChange={(e) => setNewVisitDate(e.target.value)} 
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all">تأكيد</button>
                <button type="button" onClick={() => setShowAddVisit(false)} className="flex-1 bg-slate-50 text-slate-500 py-4 rounded-2xl font-bold border border-slate-100">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Dashboard Modal */}
      {showAiDashboard && id && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-[2.5rem] w-full max-w-[1000px] p-6 md:p-8 shadow-2xl relative my-8">
            
            {/* زر إغلاق الـ Modal */}
            <button 
              onClick={() => setShowAiDashboard(false)}
              className="absolute top-6 left-6 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors shadow-sm text-slate-500 hover:text-slate-800 z-10"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            {/* عنوان لوحة الـ AI */}
            <div className="mb-6 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-black text-deep-teal flex items-center gap-3">
                <span className="material-symbols-outlined text-white bg-gradient-to-r from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-md">psychology</span>
                تحليل الذكاء الاصطناعي لملف المريض: {patient?.name}
              </h2>
            </div>

            {/* محتوى لوحة التحكم وجلب البيانات بالرقم الديناميكي مع إرسال التوكن */}
            <div className="max-h-[70vh] overflow-y-auto px-1">
              <PatientHealthDashboard patientId={parseInt(id)} token={token || undefined} />
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetail;
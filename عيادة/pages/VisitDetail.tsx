import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import ToothMapAll from '@/components/ToothMapAll';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

// --- الواجهات (Interfaces) ---
interface PatientTooth {
  id: number;
  image_id: number;
  tooth_name: string;
  finding_type: string;
  tooth_bbox: string; 
  defect_bbox: string; 
}

interface PredictionRecord {
  id: number;
  visit_id: number;
  file_path: string;
  image_type: string;
  created_at_time: string;
  doctor_notes?: string; // تحديث الواجهة لتشمل الملاحظات القادمة من الباك إيند
  patient_teeth?: PatientTooth[]; 
}

const VisitDetail: React.FC = () => {
  const { id, visitId } = useParams<{ id: string, visitId: string }>();
  const navigate = useNavigate();

  // --- حالات البيانات ---
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // --- حالات الموديل (Modal States) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // --- 💡 حالات تحكم إضافية خاصة بملاحظات الطبيب ---
  const [editingPredictionId, setEditingPredictionId] = useState<number | null>(null);
  const [doctorNotes, setDoctorNotes] = useState<string>('');

  // --- الحصول على التوكن من localStorage ---
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  const isDoctor = userRole === 'doctor';
  
  // إعدادات الـ Headers الموحدة
  const getAuthConfig = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // دالة المساعدة لترتيب الأسنان
  const sortTeethData = (teeth: PatientTooth[]) => {
    return [...teeth].sort((a, b) => {
      const getNum = (name: string) => {
        const match = name.match(/\d+/); 
        return match ? parseInt(match[0], 10) : 999;
      };
      return getNum(a.tooth_name) - getNum(b.tooth_name);
    });
  };

  // 1. جلب البيانات مع التوكن
  const fetchPredictions = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const config = getAuthConfig();
      const resImages = await axios.get(`http://127.0.0.1:8000/prediction?id_visite=${visitId}`, config);
      const imagesData = resImages.data;

      const mergedData = await Promise.all(
        imagesData.map(async (img: any) => {
          try {
            // جلب تفاصيل الأسنان لكل صورة مع التوكن
            const resTeeth = await axios.get(`http://127.0.0.1:8000/pattienttooth/${img.id}`, config);
            return { ...img, patient_teeth: resTeeth.data };
          } catch {
            return { ...img, patient_teeth: [] };
          }
        })
      );
      setPredictions(mergedData);
    } catch (error: any) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setToast({ message: 'فشل في تحديث قائمة البيانات', type: 'error' });
      }
    }
  };

  useEffect(() => {
    if (visitId) fetchPredictions();
  }, [visitId]);

  // 2. معالجة رفع الصور مع التوكن
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !token) return;
    
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // إرسال طلب الرفع مع التوكن
      await axios.post(`http://127.0.0.1:8000/predictionDupple?visite_id=${visitId}`, formData, getAuthConfig());
      
      setToast({ message: 'تم التحليل بنجاح', type: 'success' });
      setSelectedFile(null);
      fetchPredictions(); 
    } catch (error: any) {
      setToast({ message: 'خطأ في الاتصال بالسيرفر أو صلاحية الجلسة', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 3. منطق الحذف مع التوكن
  const openDeleteModal = (imageId: number) => {
    setIdToDelete(imageId);
    setIsModalOpen(true);
  };

  const confirmDeleteAction = async () => {
    if (idToDelete === null || !token) return;
    try {
      setDeleteLoading(true);
      // طلب الحذف مع التوكن
      await axios.delete(`http://127.0.0.1:8000/prediction/${idToDelete}`, getAuthConfig());
      setPredictions(prev => prev.filter(r => r.id !== idToDelete));
      setToast({ message: 'تم الحذف بنجاح', type: 'success' });
    } catch (error: any) {
      setToast({ message: 'فشل الحذف من السيرفر', type: 'error' });
    } finally {
      setDeleteLoading(false);
      setIsModalOpen(false);
      setIdToDelete(null);
    }
  };

  // 💡 4. دالة تحديث ملاحظات الطبيب وإرسالها للباك إيند
  const handleUpdateNotes = async (predictionId: number) => {
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      await axios.put(`http://127.0.0.1:8000/prediction/${predictionId}/notes`, {
        doctor_notes: doctorNotes
      }, config);

      setToast({ message: 'تم حفظ ملاحظات الدكتور بنجاح', type: 'success' });
      setEditingPredictionId(null);
      fetchPredictions(); // إعادة جلب البيانات لتحديث العرض تلقائياً بالقيم الجديدة
    } catch (error: any) {
      setToast({ message: 'فشل في حفظ الملاحظات، يرجى المحاولة لاحقاً', type: 'error' });
    }
  };

  return isDoctor && (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 p-4" dir="rtl">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-deep-teal">منصة التشخيص الذكي للأسنان</h1>
          <p className="text-slate-500 font-bold mt-1">المريض: #{id} | رقم الزيارة: #{visitId}</p>
        </div>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-slate-100 rounded-2xl font-bold hover:bg-slate-200 transition-all text-slate-600">
          رجوع
        </button>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
        <h3 className="text-xl font-black text-deep-teal mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">analytics</span>
          تحليل صور الأشعة (YOLO v11)
        </h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="relative border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:bg-slate-50 cursor-pointer group">
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-5xl text-slate-300 group-hover:text-primary transition-colors">upload_file</span>
              <p className="text-slate-500 font-bold">{selectedFile ? <span className="text-primary font-black">{selectedFile.name}</span> : "اختر ملفاً لتحليله"}</p>
            </div>
          </div>
          <button type="submit" disabled={!selectedFile || loading} className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg hover:bg-deep-teal transition-all disabled:bg-slate-200">
            {loading ? "جاري التحليل..." : "بدء الفحص الرقمي"}
          </button>
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-12">
        {predictions.map((record) => (
          <div key={record.id} className="bg-white rounded-[3rem] shadow-md border border-slate-200 overflow-hidden">
            
            {/* Header السجل */}
            <div className="bg-sky-950 p-5 flex justify-between items-center px-10">
                <span className="text-white font-black tracking-widest text-lg">سجل الفحص #{record.id}</span>
                <button 
                 onClick={() => openDeleteModal(record.id)} 
                 className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-5 py-2 rounded-xl transition-all border border-red-500/30 font-bold"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                  <span>حذف</span>
                </button>
            </div>

            {/* الصورة */}
            <div className="w-full bg-slate-900 flex items-center justify-center p-6 min-h-[400px]">
              <img
                src={`http://127.0.0.1:8000/static/temp/${record.file_path.split('\\').pop()}`}
                className="max-w-full h-auto rounded-3xl shadow-2xl border-2 border-slate-800"
                alt="Analysis"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/800x400?text=Error"; }}
              />
            </div>

            <ToothMapAll teethData={record.patient_teeth || []} />

            <div className="p-8 space-y-6">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-black text-lg text-deep-teal">نتائج التشخيص</h4>
                  <span className="text-xs font-bold text-slate-400">التوقيت: {record.created_at_time}</span>
                </div>

                <div className="overflow-hidden border border-slate-100 rounded-3xl">
                  <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-4 text-xs font-black text-slate-500 border-b">السن</th>
                        <th className="p-4 text-xs font-black text-slate-500 border-b text-center">إحداثيات (BBox)</th>
                        <th className="p-4 text-xs font-black text-slate-500 border-b">نوع الإصابة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {record.patient_teeth && record.patient_teeth.length > 0 ? (
                        sortTeethData(record.patient_teeth).map((tooth, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors font-bold">
                            <td className="p-4 text-red-500">{tooth.tooth_name}</td>
                            <td className="p-4 text-center">
                              <code className="bg-blue-50 text-blue-500 px-2 py-1 rounded text-[10px]">{tooth.tooth_bbox}</code>
                            </td>
                            <td className="p-4 font-black text-slate-700">{tooth.finding_type}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="p-10 text-center text-slate-400 italic">لا توجد إصابات مكتشفة.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 💡 قسم ملاحظات الدكتور المضاف حديثاً والمربوط بالـ API */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h5 className="font-black text-sm text-slate-700 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-xl">edit_note</span>
                    الملاحظات الطبية والتوصيات
                  </h5>
                  
                  {editingPredictionId !== record.id && (
                    <button
                      onClick={() => {
                        setEditingPredictionId(record.id);
                        setDoctorNotes(record.doctor_notes || '');
                      }}
                      className="text-xs font-black text-primary hover:text-deep-teal flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      {record.doctor_notes ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
                    </button>
                  )}
                </div>

                {editingPredictionId === record.id ? (
                  <div className="space-y-3 transition-all">
                    <textarea
                      value={doctorNotes}
                      onChange={(e) => setDoctorNotes(e.target.value)}
                      placeholder="اكتب تشخيصك اليدوي أو التوصيات الطبية هنا لعرضها في ملف المريض..."
                      className="w-full min-h-[100px] p-4 text-sm bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-bold text-slate-700 resize-none transition-all"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleUpdateNotes(record.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">save</span>
                        حفظ التعديلات
                      </button>
                      <button
                        onClick={() => setEditingPredictionId(null)}
                        className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs rounded-xl transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm font-bold leading-relaxed px-1 ${record.doctor_notes ? 'text-slate-600' : 'text-slate-400 italic'}`}>
                    {record.doctor_notes ? record.doctor_notes : 'لا توجد ملاحظات مسجلة من قبل الدكتور لهذا الفحص حتى الآن.'}
                  </p>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDeleteAction}
        loading={deleteLoading}
        message="هل أنت متأكد من حذف هذه الصورة وجميع التحليلات المرتبطة بها؟"
      />
    </div>
  );
};

export default VisitDetail;

import React, { useState } from 'react';
import Toast from './Toast';

interface XRayAnalysisProps {
  onExportReport?: () => void;
}

const XRayAnalysis: React.FC<XRayAnalysisProps> = ({ onExportReport }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [analysisDone, setAnalysisDone] = useState(true);

  const handleUpload = () => {
    setIsUploading(true);
    setAnalysisDone(false);
    setTimeout(() => {
      setIsUploading(false);
      setAnalysisDone(true);
      setToast('اكتمل تحليل الأشعة بالذكاء الاصطناعي!');
    }, 2500);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary/5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl animate-pulse">psychology</span>
          <h3 className="text-lg font-bold text-deep-teal">تحليل الذكاء الاصطناعي للأشعة</h3>
        </div>
        <button 
          onClick={handleUpload}
          disabled={isUploading}
          className="text-xs font-black bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-wide flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              جاري الرفع...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">cloud_upload</span>
              تحميل أشعة جديدة
            </>
          )}
        </button>
      </div>

      <div className="p-6">
        {isUploading ? (
          <div className="aspect-[2/1] bg-slate-100 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-3xl animate-bounce">bolt</span>
             </div>
             <p className="font-bold">جاري معالجة الصور وتحليل الأنسجة...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
             <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase">الأصلية (بدون تحليل)</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-900 shadow-inner">
                  <img
                    alt="Before"
                    className="w-full h-full object-cover grayscale opacity-80"
                    src="https://picsum.photos/seed/xray1/800/600"
                  />
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-1 rounded-lg uppercase tracking-wider">رؤية المحرك (AI Vision)</span>
                </div>
                <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30 aspect-[4/3] bg-slate-900 shadow-xl group">
                  <img
                    alt="After"
                    className="w-full h-full object-cover"
                    src="https://picsum.photos/seed/xray2/800/600"
                  />
                  {analysisDone && (
                    <>
                      <div className="absolute top-[30%] left-[35%] w-14 h-14 border-2 border-red-500 rounded-full bg-red-500/20 animate-pulse"></div>
                      <div className="absolute top-[28%] left-[45%] bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">تسوس مكتشف (88%)</div>
                      
                      <div className="absolute bottom-[20%] right-[25%] w-20 h-10 border-2 border-primary rounded-full bg-primary/20"></div>
                      <div className="absolute bottom-[16%] right-[30%] bg-primary text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-lg">جسر ناجح</div>
                    </>
                  )}
                </div>
             </div>
          </div>
        )}

        <div className="mt-8 bg-slate-50 p-5 rounded-2xl flex items-start gap-4 border border-slate-100">
          <span className="material-symbols-outlined text-amber-500 text-2xl">warning</span>
          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-deep-teal mb-1">تنبيه النظام:</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              أظهر التحليل الآلي وجود تسوس في السن رقم 14 بنسبة ثقة 88%. يوصى بإجراء فحص سريري إضافي. تم رصد تحسن ملحوظ في كثافة العظم حول السن 22 مقارنة بالأشعة السابقة.
            </p>
          </div>
          <button 
            onClick={() => onExportReport?.()}
            className="text-primary text-xs font-black uppercase hover:underline shrink-0"
          >
            تصدير تقرير
          </button>
        </div>
      </div>
    </div>
  );
};

export default XRayAnalysis;

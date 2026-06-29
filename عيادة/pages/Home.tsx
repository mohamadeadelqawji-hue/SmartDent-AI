import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-20" dir="rtl">
      
      {/* Hero Section - قسم الترحيب */}
      <section className="flex flex-col md:flex-row items-center gap-12 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
        <div className="flex-1 space-y-6 text-right">
          <div className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-black">
            مستقبل طب الأسنان الرقمي
          </div>
          <h1 className="text-5xl font-black text-deep-teal leading-tight">
            نظام التشخيص الذكي <br/>
            <span className="text-primary">بإشراف د. أحمد</span>
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed font-bold">
            هذا النظام ليس مجرد أداة برمجية، بل هو مساعد رقمي متطور يعتمد على أحدث خوارزميات YOLOv11 لتحليل الصور الشعاعية بدقة تصل إلى 99%، مما يسهل عملية اتخاذ القرار الطبي.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-1"
            >
              ابدأ العمل الآن
            </button>
            <button className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">
              اقرأ المزيد
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="w-full h-[400px] bg-slate-100 rounded-[2.5rem] overflow-hidden relative border-4 border-white shadow-2xl">
             {/* هنا يمكن وضع صورة دكتور أحمد أو صورة تعبيرية لطب الأسنان */}
             <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-deep-teal/20">
                <span className="material-symbols-outlined text-[120px] text-primary/30">dentistry</span>
             </div>
          </div>
          {/* كرت إحصائي عائم */}
          <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold">دقة التشخيص</p>
              <p className="text-xl font-black text-deep-teal">99.8%</p>
            </div>
          </div>
        </div>
      </section>

      {/* شرح د. أحمد - فلسفة العمل */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-deep-teal text-center">لماذا هذا النظام؟</h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* الميزة 1 */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary/30 transition-all group">
            <div className="w-14 h-14 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h3 className="text-xl font-black text-deep-teal mb-4">الرؤية الحاسوبية</h3>
            <p className="text-slate-500 font-bold text-sm leading-loose">
              تطبيق تقنيات Deep Learning لتمكين الكمبيوتر من رؤية وتحليل التفاصيل الدقيقة في الأشعة التي قد تخفى على العين البشرية في ظروف الإرهاق.
            </p>
          </div>

          {/* الميزة 2 */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary/30 transition-all group">
            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">history_edu</span>
            </div>
            <h3 className="text-xl font-black text-deep-teal mb-4">الأرشفة الذكية</h3>
            <p className="text-slate-500 font-bold text-sm leading-loose">
              بناء سجل طبي رقمي لكل مريض يسمح بمتابعة تطور الحالات المرضية (Longitudinal Tracking) ومقارنة النتائج عبر الزمن.
            </p>
          </div>

          {/* الميزة 3 */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:border-primary/30 transition-all group">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <span className="material-symbols-outlined text-3xl">security</span>
            </div>
            <h3 className="text-xl font-black text-deep-teal mb-4">أمن البيانات</h3>
            <p className="text-slate-500 font-bold text-sm leading-loose">
              نظام محمي بالكامل يضمن خصوصية صور المريض وبياناته، مع صلاحيات دخول صارمة للأطباء والمساعدين فقط.
            </p>
          </div>
        </div>
      </section>

      {/* Footer - ختامية بسيطة */}
      <footer className="text-center py-10 border-t border-slate-100">
        <p className="text-slate-400 font-bold text-sm">
        حقوق النشر © 2026 - نظام التشخيص الذكي للأسنان | تطوير: م. محمد عادل قاوجي  .  
        </p>
      </footer>
    
    </div>
  );
};

export default Home;

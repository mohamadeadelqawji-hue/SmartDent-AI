
import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative flex flex-col items-center">
        {/* حلقة التحميل الخارجية */}
        <div className="w-24 h-24 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
        
        {/* أيقونة السن في المنتصف */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white mb-8  rounded-full shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-3xl text-primary leading-none">dentistry</span>
          </div>
        </div>
        
        {/* نص توضيحي */}
        <p className="mt-8 text-slate-500 font-bold text-sm tracking-widest animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;

import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title?: string;        // عنوان المودال (اختياري)
  message?: string;      // الرسالة التحذيرية (اختياري)
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading,
  title = "تأكيد الحذف", // قيمة افتراضية
  message = "هل أنت متأكد من حذف هذا السجل؟" // قيمة افتراضية
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-md transform transition-all text-center space-y-6 border border-slate-100">
        
        {/* أيقونة التحذير */}
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-50 border-8 border-red-100/50">
          <span className="material-symbols-outlined text-5xl text-red-500 animate-pulse">warning</span>
        </div>

        <div className="space-y-2">
          {/* العنوان الديناميكي */}
        
          
          {/* الرسالة الديناميكية */}
          <p className="text-slate-500 font-bold leading-relaxed px-4">
            {message} <br/>
            <span className="text-red-500 text-sm font-black">لا يمكن التراجع عن هذا الإجراء لاحقاً.</span>
          </p>
        </div>

        <div className="flex flex-row gap-3 pt-4">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full bg-red-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-red-200 hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : " احذف"}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
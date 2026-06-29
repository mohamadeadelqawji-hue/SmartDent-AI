import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  // 1. إذا لم يكن هناك توكن، ارجع لصفحة تسجيل الدخول
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. إذا كانت الرتبة المطلوبة غير متوفرة لهذا المستخدم
  if (allowedRoles && !allowedRoles.includes(userRole || '')) {
    return <Navigate to="/dashboard" replace />; // أو صفحة "غير مصرح لك"
  }

  // 3. إذا كان كل شيء تمام، اعرض الصفحة المطلوبة
  return <Outlet />;
};

export default ProtectedRoute;
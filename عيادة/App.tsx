
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import VisitDetail from './pages/VisitDetail';
import PatientsList from './pages/PatientsList';
import PatientDetail from './pages/PatientDetail';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import LoadingOverlay from './components/LoadingOverlay';
import Home from './pages/Home';
// import PatientProgress from './pages/PatientProgress';
// import Invoices from './pages/Invoices';
const AppContent: React.FC<{ 
  isAuthenticated: boolean, 
  handleLogin: () => void, 
  handleLogout: () => void 
}> = ({ isAuthenticated, handleLogin, handleLogout }) => {
  const location = useLocation();
  const [isNavigating, setIsNavigating] = useState(false);

  // مراقبة تغيير المسار لإظهار شاشة التحميل
  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 700); // مدة تحميل وهمية لجمالية التصميم

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light">
      {isNavigating && <LoadingOverlay />}
      <Sidebar onLogout={handleLogout} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Home/>} />
            {/* <Route path="/details" element={<PatientProgress/>} /> */}
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/patients/:id/visite/:visitId" element={<VisitDetail />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/appointments" element={<Dashboard />} />
            {/* <Route path="/billing" element={<Invoices />} /> */}
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
  };

  return (
    <HashRouter>
      <AppContent 
        isAuthenticated={isAuthenticated} 
        handleLogin={handleLogin} 
        handleLogout={handleLogout} 
      />
    </HashRouter>
  );
};

export default App;

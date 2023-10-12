// App.tsx
import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Landing from './Landing';
import VestingSchedule from './vesting/Employer';
import ToastMessage from './ToastMessage';


const App: React.FC = () => {
  const hasSelectedAWalletExtension = localStorage.getItem('walletProvider');
  const [toasts, setToasts] = useState<any[]>([]);

  const setAndShowToast = (title: string, message: React.ReactNode) => {
    const newToast = { id: new Date().getTime(), title, message };
    setToasts(prevToasts => [...prevToasts, newToast]);
  }

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={hasSelectedAWalletExtension ? <Navigate to="/employer" /> : <Landing setAndShowToast={setAndShowToast} />} />
        <Route path="/employer" element={hasSelectedAWalletExtension ? <VestingSchedule setAndShowToast={setAndShowToast} /> : <Navigate to="/" />} />
      </Routes>
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      {toasts.map(toast => (
        <ToastMessage
          key={toast.id}
          id={toast.id}
          title={toast.title}
          message={toast.message}
          show={true}
          isDanger={toast.isDanger}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
    </Router>

  );
};

export default App;

// App.tsx
import React, {useState} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Landing from './Landing';

import ToastMessage from './ToastMessage';
import About from './vesting/About';
import YourTokenPlans from './vesting/YourPlans';
import CreatePlans from './vesting/CreatedPlans';

type AppProps = {
  runtimeURL: string;
  marloweScanURL : string;
  dAppId : string;
}

const App: React.FC<AppProps> = ({runtimeURL,marloweScanURL,dAppId}) => {
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
        <Route path="/" element={hasSelectedAWalletExtension ? <Navigate to="/created-plans" /> : <Landing setAndShowToast={setAndShowToast} />} />
        <Route path="/your-plans" element={hasSelectedAWalletExtension ? <YourTokenPlans runtimeURL={runtimeURL} marloweScanURL={marloweScanURL} dAppId={dAppId} setAndShowToast={setAndShowToast} /> : <Navigate to="/" />} />
        <Route path="/created-plans" element={hasSelectedAWalletExtension ? <CreatePlans runtimeURL={runtimeURL} marloweScanURL={marloweScanURL} dAppId={dAppId} setAndShowToast={setAndShowToast} /> : <Navigate to="/" />} />
        <Route path="/about" element={hasSelectedAWalletExtension ? <About setAndShowToast={setAndShowToast} /> : <Navigate to="/" />} />
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

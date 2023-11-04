
import React, {useState} from 'react';

import ToastMessage from './ToastMessage';
import {About} from './vesting/About';
import Claimer from './vesting/Claimer';
import Provider from './vesting/Provider';
import { Footer } from './Footer';
import { ConnectionWallet } from './Connection';

type AppProps = {
  runtimeURL: string;
  marloweScanURL : string;
  dAppId : string;
}

type Page = "About" | "Token Provider's View" | "Claimer's View"

const aboutPage : Page = "About"
const isAboutPage = (page:Page) => page === aboutPage
const providerPage : Page = "Token Provider's View"
const isProviderPage = (page:Page) => page === providerPage
const claimerPage = "Claimer's View"
const isClaimerPage = (page:Page) => page === claimerPage

const App: React.FC<AppProps> = ({runtimeURL,marloweScanURL,dAppId}) => {
  const selectedWalletExtensionName = localStorage.getItem('walletProvider');
  const [isWaitingConfirmation, setWaitingConfirmation] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean>(selectedWalletExtensionName?true:false); 
  const [currentPage, setCurrentPage] = useState<Page>("About"); 
  const [toasts, setToasts] = useState<any[]>([]);

  const setAndShowToast = (title: string, message: React.ReactNode) => {
    const newToast = { id: new Date().getTime(), title, message };
    setToasts(prevToasts => [...prevToasts, newToast]);
  }

  const removeToast = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }

  return (
    <div className="container">
      <div className="header">
        <div style={{width:"700px"}} className="d-flex justify-content-start align-items-baseline" >
            <span ><h1 style={{margin:0}}>Token Plan Prototype</h1> </span>
            <span ><h3 style={{margin:0,paddingLeft:"10px"}}>/ {currentPage}</h3> </span>
          </div>
          <ConnectionWallet onConnect={() => setIsConnected(true)} onDisconnect={() => {setCurrentPage(aboutPage);setIsConnected(false)}} runtimeURL={runtimeURL} setAndShowToast={setAndShowToast} /> 
        </div>
        <div> <button className="btn btn-link" disabled={isWaitingConfirmation || isAboutPage(currentPage)} onClick={() => setCurrentPage(aboutPage)}>{aboutPage}</button> 
            | <button className="btn btn-link" disabled={isWaitingConfirmation || !isConnected || isProviderPage(currentPage)} onClick={() => setCurrentPage(providerPage)}>{providerPage}</button> 
            | <button className="btn btn-link" disabled={isWaitingConfirmation || !isConnected || isClaimerPage(currentPage)}  onClick={() => setCurrentPage(claimerPage)}>{claimerPage}</button> 
            <hr></hr>
          </div>
          {isAboutPage(currentPage)?
            <About/>:(isProviderPage(currentPage)?
              <Provider onWaitingConfirmation={() => setWaitingConfirmation(true) } onConfirmation={() => setWaitingConfirmation(false)} runtimeURL={runtimeURL} marloweScanURL={marloweScanURL} dAppId={dAppId} setAndShowToast={setAndShowToast} /> 
              : <Claimer runtimeURL={runtimeURL} marloweScanURL={marloweScanURL} dAppId={dAppId} setAndShowToast={setAndShowToast} />
          )}   
        <Footer />
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
    </div>);
};

export default App;

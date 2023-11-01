import { BroswerWalletExtension, getInstalledWalletExtensions } from '@marlowe.io/wallet/browser';
import React, { } from 'react';
import { useNavigate } from 'react-router-dom';


type LandingProps = {
  setAndShowToast: (title: string, message: any, isDanger: boolean) => void
};

const Landing: React.FC<LandingProps> = ({ setAndShowToast }) => {
  const navigate = useNavigate();
  const selectedAWalletExtension = localStorage.getItem('walletProvider');
  const installedWalletExtensions = getInstalledWalletExtensions()
  if (selectedAWalletExtension) { navigate('/about') }

  async function connectWallet(walletName: string) {
    localStorage.setItem('walletProvider', walletName);
    setAndShowToast(
      `Your ${walletName} wallet is connected `,
      <span className='text-color-white'>You can see Token Plans in which your {walletName} wallet is a participant Now!</span>,
      false
    );
    navigate('/about');
  }

  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function renderWallets(extension: BroswerWalletExtension) {
      return (<div className="row mt-2">
        <div className="col-12 bordered-container" onClick={() => connectWallet(extension.name)}>
          <img src={extension.icon} alt="Icon Before" className="icon" />
          {capitalizeFirstLetter(extension.name)} Wallet
          <div className="cardano-badge">
            <img src="images/cardano-logo.png" alt="Icon After" className="icon-after" />
            Cardano
          </div>
        </div>
      </div>)
  }

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <div className="row justify-content-center">
          <img src="/images/marlowe-logo-primary.svg" alt="Logo" className="mb-4" id="marlowe-logo" />
        </div>
        <div className="row">
          <p className="title">Token Plans Prototype</p>
        </div>
        <div className="row justify-content-center mt-4">
          <div className="col-12 ">
            <div className="card">
              <div className="card-body">
                <div className="container">
                  <div className="row">
                    <div className="col-12">
                      <h5 className="card-title font-weight-bold text-left">Choose a wallet</h5>
                      <p className="card-help-text text-left">Please, select a wallet to view your Token Plans.</p>
                    </div>
                  </div>
                  {installedWalletExtensions.map(extension => renderWallets(extension))}
                  <div className="row mt-4 d-none">
                    <div className="col-6 text-left p-0">
                      <a href="#" >Learn more</a>
                    </div>
                    <div className="col-6 p-0">
                      <a href="#" className="text-muted text-right text-decoration-none">I don't have a wallet</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;

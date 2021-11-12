import { AppProps } from 'next/app';
import getConfig from 'next/config';
import React, { useEffect, useState } from 'react';

import Valist from '@valist/sdk';
import { InvalidNetworkError } from '@valist/sdk/dist/errors';

import { Magic } from 'magic-sdk';
import * as Sentry from '@sentry/nextjs';

import ValistContext from '../components/Valist/ValistContext';
import LoginContext from '../components/Login/LoginContext';
import getProviders from '../utils/providers';

import LoginForm from '../components/Login/LoginForm';

import '../styles/main.css';

type ProviderType = 'readOnly' | 'magic' | 'metaMask' | 'walletConnect';
const ProviderTypes: ProviderType[] = ['readOnly', 'magic', 'metaMask', 'walletConnect'];

const { publicRuntimeConfig } = getConfig();

function App({ Component, pageProps }: AppProps) {
  const [valist, setValist] = useState<Valist>();
  const [email, setEmail] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [magic, setMagic] = useState<Magic | undefined>();

  const handleLogin = async (providerType: ProviderType) => {
    const providers = getProviders(setMagic, setLoggedIn, email);
    let provider;

    try {
      provider = await providers[providerType]();
      window.localStorage.setItem('loginType', providerType);
    } catch (e) {
      console.log('Could not set provider, falling back to readOnly', e);
      provider = await providers.readOnly();
      window.localStorage.setItem('loginType', 'readOnly');
    }

    try {
      const valistInstance = new Valist({
        web3Provider: provider,
        metaTx: provider === publicRuntimeConfig.WEB3_PROVIDER ? false : publicRuntimeConfig.METATX_ENABLED,
      });

      try {
        await valistInstance.connect();
        setValist(valistInstance);
        console.log('Current Account: ', valistInstance.defaultAccount);
        (window as any).valist = valistInstance;
      } catch (e) {
        if (e instanceof InvalidNetworkError) {
          alert('Please switch to matic network (networkID 80001)');
          await handleLogin('readOnly');
        } else if (e instanceof Error) {
          console.log(e);
        } else {
          throw e;
        }
      }
    } catch (e) {
      console.error('Could not initialize Valist object', e);

      try {
        console.log('Could not set provider, falling back to readOnly mode');
        await handleLogin('readOnly');
      } catch (loginError) {
        console.error('Critical error, could not login with desired method or readOnly', loginError);
      }
    }
  };

  const loginObject = {
    setShowLogin,
    loggedIn,
    logOut: async () => {
      window.localStorage.clear();
      setShowLogin(false);
      setLoggedIn(false);
      if (magic) {
        magic.user.logout();
        setMagic(undefined);
      }
      await handleLogin('readOnly');
    },
  };

  useEffect(() => {
    (async () => {
      // check login type on first load and set provider to previous state
      const loginType = window.localStorage.getItem('loginType') as ProviderType;

      if (ProviderTypes.includes(loginType)) {
        await handleLogin(loginType);
      } else {
        await handleLogin('readOnly');
        window.localStorage.setItem('loginType', 'readOnly');
      }

      if ((window as any).ethereum && loginType === 'metaMask') {
        (window as any).ethereum.on('accountsChanged', async () => {
          await handleLogin('metaMask');
        });
      }
    })();
  }, []);

  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>} showDialog={true}>
      <LoginContext.Provider value={loginObject}>
        {valist
          ? <ValistContext.Provider value={valist}>
            <Component loading={false} loggedIn={loggedIn} setShowLogin={setShowLogin} {...pageProps} />
            {showLogin && <LoginForm setShowLogin={setShowLogin} handleLogin={handleLogin} setEmail={setEmail} />}
          </ValistContext.Provider>
          : <Component loading={true} loggedIn={loggedIn} setShowLogin={setShowLogin} {...pageProps} />}
      </LoginContext.Provider>
    </Sentry.ErrorBoundary>
  );
}

export default App;

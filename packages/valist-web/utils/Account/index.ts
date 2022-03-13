import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';
import { addressFromProvider, providers } from '../Providers';
import { ProviderParams } from '../Providers/types';
import { SetUseState, LoginType, ValistProvider } from './types';

export const logout = async (
  setLoginType: SetUseState<LoginType>,
  setAddress: SetUseState<string>,
  setProvider: SetUseState<ValistProvider>,
  magic: Magic | null,
) => {
  window.localStorage.setItem('loginType', 'readOnly');
  if (magic && magic?.user) {
    await magic.user.logout();
  }
  setAddress('0x0');
  setLoginType('readOnly');
};

export const login = async (
  loginType: LoginType,
  setLoginType: SetUseState<LoginType>, 
  setProvider: SetUseState<ValistProvider>,
  setAddress: SetUseState<string>,
  setLoginTried: SetUseState<boolean>,
  setMagic: SetUseState<Magic | null>,
  email: string,
) => {
  try {
    let account = '0x0';
    let params: ProviderParams = { email: '', setMagic: () => {} };

    if (loginType === 'magic') {
      params = { 
        email,
        setMagic, 
      };
    }

    const providerURL = await providers[loginType](params);

    if (loginType != 'readOnly') {
      const provider = new ethers.providers.Web3Provider(
        providerURL,
      );
      account = await addressFromProvider(provider);
      window.localStorage.setItem('loginType', loginType);
      setProvider(provider);
      setAddress(account);
      setLoginType(loginType);
    }

    setLoginTried(true);
  } catch (err) {}
};

export const onAccountChanged = (
  setLoginType: SetUseState<LoginType>,
  setProvider: SetUseState<ValistProvider>,
  setAddress: SetUseState<string>,
  setLoginTried: SetUseState<boolean>,
  email: string,
) => {
  if (window && window.ethereum) {
    ['accountsChanged', 'chainChanged'].forEach((event) => {
      window.ethereum.on(event, () => {
        const loginType = (localStorage.getItem('loginType') as LoginType);
        if (loginType === 'metaMask') {
          login(loginType, setLoginType, setProvider, setAddress, setLoginTried, ()=>{}, email);
        }
      });
    });
  };
};

export const checkLoggedIn = (required:boolean, loginType:LoginType) => {
  if (required) {
    return (loginType !== 'readOnly') ? true : false;
  }
  return true;
};
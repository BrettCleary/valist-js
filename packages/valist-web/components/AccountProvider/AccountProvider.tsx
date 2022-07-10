import React, { useState, useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { useQuery, gql } from '@apollo/client';

export interface IAccountContext {
  account: string;
  setAccount: (account: string) => void;
}

export const AccountContext = React.createContext<IAccountContext>({
  account: '',
  setAccount: (account: string) => (void 0),
});

export interface AccountProviderProps {
  children?: React.ReactNode;
}

export const query = gql`
  query UserAccounts($address: String!){
    user(id: $address) {
      accounts {
        id
        name
        metaURI
      }
    }
  }
`;

export function AccountProvider(props: AccountProviderProps) {  
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { data, loading } = useQuery(query, {
    variables: { address: address?.toLowerCase() },
  });

  const [account, _setAccount] = useState('');
  const accounts = data?.user?.accounts.map((acc: any) => acc.name) ?? [];
  const setAccount = (account: string) => _setAccount(account);

  // reset account when chain id changes
  useEffect(() => {
    _setAccount('');
  }, [chain?.id]);

  // make sure a default account is selected
  if (account === '' && accounts.length > 0) {
    _setAccount(accounts[0]);
  }

  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {props.children}
    </AccountContext.Provider>
  );
}
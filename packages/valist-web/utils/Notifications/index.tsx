import getConfig from "next/config";
import toast from "react-hot-toast";
import { getBlockExplorer } from "../Valist";

export const notify = (type: string, text?: string): string => {
  const { publicRuntimeConfig } = getConfig();

  let blockExplorer = 'polygonscan.com';
  if (publicRuntimeConfig.CHAIN_ID === '80001') {
    blockExplorer = 'mumbai.polygonscan.com';
  }
  
  switch (type) {
    case 'transaction':
      return toast.custom(() => (
        <div className='toast'>
         Transaction pending: 
          <a
            className="text-indigo-500 cursor-pointer" 
            target="_blank" 
            rel="noreferrer"
            href={`${getBlockExplorer(publicRuntimeConfig.CHAIN_ID)}/tx/${text}`}>
              view on block explorer 
          </a>
        </div>
      ), {
        position: 'top-right',
        duration: 1000000,
      });
    case 'pending':
      return toast.custom(() => (
        <div className='toast'>
         Creating transaction...
        </div>
      ), {
        position: 'top-right',
        duration: 1000000,
      });
    case 'message':
      return toast.success(`${text}`, {
        position: 'top-right',
      });
    case 'success':
      return toast.success('Transaction Successfull!', {
        position: 'top-right',
      });
    case 'text':
      return toast.custom(() => (
        <div className='toast'>
          {text}
        </div>
      ), {
        position: 'top-right',
        duration: 1000000,
      });
    case 'error':
      return toast(`${text}`, {
        position: 'top-right',
        style: {
          backgroundColor: '#ff6961',
          wordBreak: 'break-word',
          overflow: 'hidden',
        },
      });
  }
  return '';
};

export const dismiss = (id?: string) => {
  toast.dismiss(id);
};
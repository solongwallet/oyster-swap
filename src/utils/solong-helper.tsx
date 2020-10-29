import React, { useContext, useEffect, useMemo, useState } from 'react';
import { notify } from './notifications';
import { PublicKey } from '@solana/web3.js';



export class SolongHelper {
  _onSelected: (arg0:string) =>void 
  _publicKey: any
  _onProcess:boolean
  constructor() {
    console.log('SolongHelper');
    this._onSelected = (p)=> {console.log(p)}
    this._publicKey = null
    this._onProcess = false
    this.selectAccount = this.selectAccount.bind(this)
  }

  set onSelected(f:(arg0:string)=>void) {
    this._onSelected =f
  }

  get publicKey() {
    return this._publicKey;
  }

  async signTransaction(transaction: any) {
    return (window as any).solong.signTransaction(transaction);
  }

  selectAccount() {
    if (this._onProcess) {
      return 
    }
    this._onProcess = true
    console.log('solong helper select account');
    (window as any).solong
      .selectAccount()
      .then((account: any) => {
        this._publicKey = new PublicKey(account);
        console.log('window solong select:', account, 'this:', this);

        notify({
          message: `Account ${account} connected`,
          type: 'success',
        });

        if (this._onSelected) {
          this._onSelected(account);
        }
      })
      .catch(() => {})
      .finally(()=>{this._onProcess=false});
  }
}

interface SolongConfig {
  solong: SolongHelper;
  wallet: SolongHelper;
  connected: boolean;
}

const SolongContext : any= React.createContext<SolongConfig>({
  solong: new SolongHelper(),
  wallet: new SolongHelper(), 
  connected: false,
});

export function SolongProvider({ children = undefined as any }) {
  //const solong = new SolongHelper();
  const solong = useMemo(() => new SolongHelper(), []);

  const [connected, setConnected] = useState(false);
  useEffect(() => {
    console.log('trying to connect');
    solong.onSelected = (pubKey) => {
      console.log('helper on select :', pubKey);
      setConnected(true);
    };
  }, [solong]);
  return (
    <SolongContext.Provider
      value={{
        solong,
        connected,
        wallet: solong,
      }}
    >
      {children}
    </SolongContext.Provider>
  );
}

export function useSolong() {
  const context :any = useContext(SolongContext);
  return {
    connected: context.connected,
    solong: context.solong,
    wallet: context.solong,
  };
}

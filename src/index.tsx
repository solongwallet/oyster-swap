import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { WalletProvider } from "./utils/wallet";
import { ConnectionProvider } from "./utils/connection";
import { AccountsProvider } from "./utils/accounts";
import {SolongProvider} from "./utils/solong-helper"

ReactDOM.render(
  <React.StrictMode>
    <ConnectionProvider>
      <WalletProvider><SolongProvider>
        <AccountsProvider>
          <App />
        </AccountsProvider>
      </SolongProvider></WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

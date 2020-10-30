import React from "react";
import { useSolong} from "./../utils/solong-helper"
import { shortenAddress } from "./../utils/utils";
import { Identicon } from "./identicon";
import { useNativeAccount } from "./../utils/accounts";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const AccountInfo = (props: {}) => {
  const { wallet } = useSolong();
  const { account } = useNativeAccount();

  if (!wallet || !wallet.publicKey) {
    return null;
  }

  return (
    <div className="wallet-wrapper">
      <span>
        {((account?.lamports || 0) / LAMPORTS_PER_SOL).toFixed(6)} SOL
      </span>
      <div className="wallet-key">
        {shortenAddress(`${wallet.publicKey}`)}
        <Identicon
          address={wallet.publicKey.toBase58()}
          style={{ marginLeft: "0.5rem" }}
        />
      </div>
    </div>
  );
};

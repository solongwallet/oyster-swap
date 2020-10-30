import { Button, Spin } from "antd";
import React, { useState } from "react";
import { useConnection, useSlippageConfig } from "../../utils/connection";
import { useSolong } from "../../utils/solong-helper";
import { CurrencyInput, useCurrencyPairState } from "./../currencyInput";
import { LoadingOutlined } from "@ant-design/icons";
import { swap, usePoolForBasket } from "../../utils/pools";
import { notify } from "../../utils/notifications";
import "./trade.less";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

// TODO:
// Compute price breakdown with/without fee
// Show slippage
// Show fee information
// TODO: destination account shouldnt be required

export const TradeEntry = () => {
  const { wallet } = useSolong();
  const connection = useConnection();
  const [pendingTx, setPendingTx] = useState(false);
  const { A, B, setLastTypedAccount } = useCurrencyPairState();
  const pool = usePoolForBasket([A?.mintAddress, B?.mintAddress]);
  const { slippage } = useSlippageConfig();

  const swapAccounts = () => {
    const tempMint = A.mintAddress;
    const tempAmount = A.amount;
    A.setMint(B.mintAddress);
    A.setAmount(B.amount);
    B.setMint(tempMint);
    B.setAmount(tempAmount);
  };

  const handleSwap = async () => {
    if (A.account && B.account && A.mint && B.mint) {
      try {
        setPendingTx(true);

        const components = [
          {
            account: A.account,
            amount: A.convertAmount(),
          },
          {
            account: B.account,
            amount: B.convertAmount(),
          },
        ];

        await swap(connection, wallet, components, slippage, pool);
      } catch {
        notify({
          description:
            "Please try again and approve transactions from your wallet",
          message: "Swap trade cancelled.",
          type: "error",
        });
      } finally {
        setPendingTx(false);
      }
    }
  };

  return (
    <>
      <div>
        <CurrencyInput
          title="Input"
          onInputChange={(val: any) => {
            if (A.amount !== val) {
              setLastTypedAccount(A.mintAddress);
            }

            A.setAmount(val);
          }}
          amount={A.amount}
          mint={A.mintAddress}
          onMintChange={(item) => {
            A.setMint(item);
          }}
        />
        <Button type="text" onClick={swapAccounts}>
          ↓
        </Button>
        <CurrencyInput
          title="To (Estimate)"
          onInputChange={(val: any) => {
            if (B.amount !== val) {
              setLastTypedAccount(B.mintAddress);
            }

            B.setAmount(val);
          }}
          amount={B.amount}
          mint={B.mintAddress}
          onMintChange={(item) => {
            B.setMint(item);
          }}
        />
      </div>
      <Button
        className="trade-button"
        type="primary"
        size="large"
        onClick={handleSwap}
        style={{ width: "100%" }}
        disabled={
          pendingTx || !A.account || !B.account || A.account === B.account
        }
      >
        Swap
        {pendingTx && <Spin indicator={antIcon} className="trade-spinner" />}
      </Button>
    </>
  );
};

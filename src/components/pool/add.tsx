import React, { useState } from "react";
import { addLiquidity, usePoolForBasket } from "../../utils/pools";
import { Button, Popover } from "antd";
import { useSolong } from "../../utils/solong-helper"
import { useConnection, useSlippageConfig } from "../../utils/connection";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { notify } from "../../utils/notifications";
import { SupplyOverview } from "./supplyOverview";
import { CurrencyInput, useCurrencyPairState } from "../currencyInput";
import { DEFAULT_DENOMINATOR } from "./config";
import "./add.less";
import { PoolConfig } from "../../models";

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

export const AddToLiquidity = () => {
  const { wallet } = useSolong();
  const connection = useConnection();
  const [pendingTx, setPendingTx] = useState(false);
  const { A, B, setLastTypedAccount } = useCurrencyPairState();
  const pool = usePoolForBasket([A?.mintAddress, B?.mintAddress]);
  const { slippage } = useSlippageConfig();
  const options: PoolConfig = {
    curveType: 0,
    tradeFeeNumerator: 25,
    tradeFeeDenominator: DEFAULT_DENOMINATOR,
    ownerTradeFeeNumerator: 5,
    ownerTradeFeeDenominator: DEFAULT_DENOMINATOR,
    ownerWithdrawFeeNumerator: 0,
    ownerWithdrawFeeDenominator: DEFAULT_DENOMINATOR,
  };

  const provideLiquidity = async () => {
    if (A.account && B.account && A.mint && B.mint) {
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

      addLiquidity(connection, wallet, components, slippage, pool, options)
        .then(() => {
          setPendingTx(false);
        })
        .catch((e) => {
          console.log("Transaction failed", e);
          notify({
            description:
              "Please try again and approve transactions from your wallet",
            message: "Adding liquidity cancelled.",
            type: "error",
          });
          setPendingTx(false);
        });
    }
  };

  return (
    <div>
      <Popover
        trigger="hover"
        content={
          <div style={{ width: 300 }}>
            Liquidity providers earn a fixed percentage fee on all trades
            proportional to their share of the pool. Fees are added to the pool,
            accrue in real time and can be claimed by withdrawing your
            liquidity.
          </div>
        }
      >
        <Button type="text">Read more about providing liquidity.</Button>
      </Popover>

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
      <div>+</div>
      <CurrencyInput
        title="Input"
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
      <SupplyOverview
        mintAddress={[A.mintAddress, B.mintAddress]}
        pool={pool}
      />
      <Button
        className="add-button"
        type="primary"
        size="large"
        onClick={provideLiquidity}
        disabled={
          pendingTx || !A.account || !B.account || A.account === B.account
        }
      >
        {pool ? "Provide Liquidity" : "Create Liquidity Pool"}
        {pendingTx && <Spin indicator={antIcon} className="add-spinner" />}
      </Button>
    </div>
  );
};

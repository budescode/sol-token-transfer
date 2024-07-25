'use client';
import Image from "next/image";
import { FormEvent, useMemo, } from "react";
import { NextPage } from "next";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import * as web3 from "@solana/web3.js";
import { WalletConnectButton, WalletDisconnectButton, WalletModal, WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
//getting balance
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";
import { error } from "console";

require("@solana/wallet-adapter-react-ui/styles.css");

export default function Home() {
   
    const [balance, setBalance] = useState(0);
    const { connection } = useConnection();
    const { publicKey,sendTransaction } = useWallet();
    const [addressToSend, setaddressToSend] = useState("")
    const [amountToSend, setamountToSend] = useState(0)
    const sendSol = (
        event:any

    ) => {
        event.preventDefault();
      
        const transaction = new web3.Transaction();
        const recipientPubKey = new web3.PublicKey(addressToSend);
      
        const sendSolInstruction = web3.SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey: recipientPubKey,
          lamports: LAMPORTS_PER_SOL * Number(amountToSend),
        });
      
        transaction.add(sendSolInstruction);

        sendTransaction(transaction, connection).then((sig) => {
            console.log(`Transaction successful: ${sig}`);

        })
        .catch((error) => {
            console.error(`Transaction failed: ${error}`);
          });
        ;
      };

    useEffect(() => {
        if (!connection || !publicKey) {
            console.log("no connection")
          return;
        }
        console.log("there is connection", connection.rpcEndpoint, publicKey.toString())
        connection.onAccountChange(
          publicKey,
          (updatedAccountInfo) => {
            setBalance(updatedAccountInfo.lamports / LAMPORTS_PER_SOL);
          },
          "confirmed",
        );
    
        connection.getAccountInfo(publicKey).then((info) => {
            console.log(info, "yeah info")
            if(info)setBalance(info!.lamports);
        });
      }, [connection, publicKey]);

    return (
        <main>

              <WalletMultiButton />
         
              <p>{publicKey ? `Balance: ${balance / LAMPORTS_PER_SOL} SOL` : ""}</p>
              <form onSubmit={sendSol}>
              <div>
                    <label>Transfer Address</label>
                    <input style={{
                        width: "100%",
                        padding: "10px",
                        border: '1px solid #ccc',   
                    }}
                    value = {addressToSend}
                    onChange={(e)=>setaddressToSend(e.target.value)}
                    required
                    />

                </div>

                <div>
                    <label>Transfer Amount</label>
                    <input style={{
                        width: "100%",
                        padding: "10px",
                        border: '1px solid #ccc',
                    }}
                    type="number"
                    onChange={(e)=> {
                    e?    setamountToSend(Number(e.target.value)) : null
                    }}
                    value = {amountToSend}
                    required
                    />
                </div>

                <button type="submit">Submit</button>

              </form>
              {/* <button onClick={sendSol}>Send sol t</button> */}
          </main>  
      );
}

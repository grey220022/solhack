// About.js
import React, { useState } from 'react';
import { Connection, clusterApiUrl, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Buffer } from 'buffer';
import BN from 'bn.js';

window.Buffer = Buffer;
const programId = new PublicKey('BqE2p1PUiUGcY4wXa2mrhsxL8Rw9ki3ZiBsiZu6F64Ne');
const connection = new Connection(clusterApiUrl('devnet'));

function About() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');


  const getWalletAddress = () => {
    if (window.solana && window.solana.isPhantom && window.solana.publicKey) {
      return window.solana.publicKey.toString();
    } else {
      alert('Connect wallet first!');
      throw new Error('Wallet not connected');
    }
  };

  const initializeState = async () => {
    const walletAddress = getWalletAddress();
    console.log("walletAddress", walletAddress);

    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from('global-state')],
      programId
    );
    console.log("pda", pda);
    const transaction = new Transaction().add({
      keys: [
        { pubkey: pda, isSigner: false, isWritable: true },
        { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: false },
      ],
      programId,
      //data: Buffer.from([0]), // assuming 0 is the code for initialize in the instruction data
      data: Buffer.from('afaf6d1f0d989bed', 'hex'),
    });

    transaction.feePayer = new PublicKey(walletAddress);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

    try {
      const signed = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      setTransactionStatus('Initialization successful!');
    } catch (error) {
      console.error('Initialization failed', error);
      setTransactionStatus(`Initialization failed: ${error.message}`);
    }
  };

  const getCounterValue = async () => {
    const walletAddress = getWalletAddress();

    const pda = await PublicKey.findProgramAddress(['global-state'], programId);

    const accountInfo = await connection.getAccountInfo(pda[0]);
    if (accountInfo === null) {
      alert('Account not found');
      return;
    }

    const data = accountInfo.data;
    const counter = new BN(data.slice(8, 16), 'le').toNumber();
    console.log("counter", counter);
  };

  const incrementCounter = async () => {
    const walletAddress = getWalletAddress();

    const pda = await PublicKey.findProgramAddress(['global-state'], programId);

    const transaction = new Transaction().add({
      keys: [
        { pubkey: pda[0], isSigner: false, isWritable: true },
        { pubkey: new PublicKey(walletAddress), isSigner: true, isWritable: false },
      ],
      programId,
      data: Buffer.from([1]), // assuming 1 is the code for increment in the instruction data
    });

    transaction.feePayer = new PublicKey(walletAddress);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

    const signed = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    await connection.confirmTransaction(signature);

    getCounterValue();
  };

  const sendFund = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      alert("Solana object not found! Get a Phantom Wallet 👻");
      return;
    }

    if (!phoneNumber) {
      alert("Please enter a valid phone number");
      return;
    }
    //console.log("pk", window.solana.publicKey);
    const recipientAddress = "uLFwRn5gaaKa7DUZ72vTmnDfr8yzH991GFNCJpV8RmF";
    try {
      const connection = new Connection(clusterApiUrl('devnet'));
      const fromPubkey = window.solana.publicKey;
      const toPubkey = new PublicKey(recipientAddress);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL
        })
      );

      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const signedTransaction = await window.solana.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature, 'processed');

      setTransactionStatus('Transaction successful!');
    } catch (err) {
      console.error("Transaction failed", err);
      setTransactionStatus('Transaction failed');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <input
            type="text"
            placeholder="Enter phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ padding: '10px', margin: '10px', fontSize: '16px' }}
          />
          <button onClick={sendFund} style={{ padding: '10px 20px', fontSize: '16px' }}>Send Fund</button>
        </div>
        {transactionStatus && <p>{transactionStatus}</p>}
      </header>
    </div>
  );
}

export default About;

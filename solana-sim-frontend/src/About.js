// About.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Connection, clusterApiUrl, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Buffer } from 'buffer';

window.Buffer = Buffer;


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

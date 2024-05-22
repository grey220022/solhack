import React, { useState, useEffect } from 'react';
import './App.css';
import { Connection, clusterApiUrl, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import QR from './QR.PNG';
import { Buffer } from 'buffer';
import background from './background.png'; // 引入背景图片
import head from './head.png'; // 引入头部图片

window.Buffer = Buffer;
function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [warning, setWarning] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        const walletAddress = response.publicKey.toString();
        setWalletAddress(walletAddress);

        const connection = new Connection(clusterApiUrl('devnet'));
        try {
          await connection.getEpochInfo();
          setWarning('');
        } catch (error) {
          console.error("Failed to connect to devnet", error);
          setWarning('Please switch your Phantom wallet network to Devnet.');
          setWalletAddress(null);
        }
      } catch (err) {
        if (err.code === 4001) {
          setWarning('Connection request was rejected. Please try again.');
        } else {
          console.error("Connection failed", err);
        }
      }
    } else {
      alert("Solana object not found! Get a Phantom Wallet 👻");
    }
  };

  const signMessage = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        const message = "Sign this message to log in solana sim." + "\nWallet address: " + walletAddress;
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
        const signature = signedMessage.signature.toString('base64');
        console.log("signature", signature);
        // Mock backend verification
        const mockResponse = { success: true };

        if (mockResponse.success) {
          setIsVerified(true); // 设置验证状态为真
        } else {
          alert('Connection verification failed');
        }
      } catch (err) {
        console.error("Failed to sign message", err);
      }
    } else {
      alert("Solana object not found! Get a Phantom Wallet 👻");
    }
  };

  const buySolanaSIM = async () => {
    if (window.solana && window.solana.isPhantom) {
      const connection = new Connection(clusterApiUrl('devnet'));
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey('uLFwRn5gaaKa7DUZ72vTmnDfr8yzH991GFNCJpV8RmF'),
          lamports: 0.01 * LAMPORTS_PER_SOL, // 0.01 SOL
        })
      );

      try {
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(walletAddress);

        const signedTransaction = await window.solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature, 'processed');

        alert('Transaction successful!');
        setHasPurchased(true);
      } catch (err) {
        console.error("Transaction failed", err);
        alert('Transaction failed');
      }
    } else {
      alert("Solana object not found! Get a Phantom Wallet 👻");
    }
  };

  const isNFTOwner = () => {
    return walletAddress !== "8ET2oskezX5Yp6eoNGGxNJKoCNxJgaeJCCphJs3rfPWq" || hasPurchased;
  };

  const formatWalletAddress = (address) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (window.solana && window.solana.isPhantom) {
      window.solana.on("connect", () => {
        setWalletAddress(window.solana.publicKey.toString());
      });

      window.solana.connect({ onlyIfTrusted: true }).catch(() => {
      });
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div className="top-bar">
          <img src={head} alt="Head" className="head-image" />
          {walletAddress ? (
            <>{
              isVerified ? (
              <span className="welcome">Hello, {formatWalletAddress(walletAddress)}</span>
              ): null
              }
              {isVerified ? (
                isNFTOwner() ? (
                  <img src={QR} alt="Verified" style={{ width: '350px' }} />
                ) : (
                  <button className="top-button" onClick={buySolanaSIM}>Buy Solana SIM</button>
                )
              ) : (
                <button className="top-button" onClick={signMessage}>Login</button>
              )}
            </>
          ) : (
            <button className="top-button" onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
        {warning && <p style={{ color: 'red' }}>{warning}</p>}
        <img src={background} alt="Background" className="background-image" />
      </header>      
    </div>
  );
}

export default App;

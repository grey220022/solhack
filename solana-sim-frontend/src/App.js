import React, { useState, useEffect } from 'react';
import './App.css';
import { Connection, clusterApiUrl } from '@solana/web3.js';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [warning, setWarning] = useState('');
  const [message, setMessage] = useState('Sign this message to authenticate');

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
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
        const signature = signedMessage.signature.toString('base64');
        console.log("signature", signature);
        // Mock backend verification
        const mockResponse = { success: true };

        if (mockResponse.success) {
          alert('Connection verified successfully');
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
        {warning && <p style={{ color: 'red' }}>{warning}</p>}
        {walletAddress ? (
          <div>
            <p>Connected to: {walletAddress}</p>
            <button onClick={signMessage}>Sign Message</button>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>
    </div>
  );
}

export default App;

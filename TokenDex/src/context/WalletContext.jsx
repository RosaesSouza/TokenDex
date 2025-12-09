import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask não encontrada!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const selected = accounts[0];
      setWallet(selected);

      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);

      const ethSigner = await ethProvider.getSigner();
      setSigner(ethSigner);

      return selected;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WalletContext.Provider value={{ wallet, provider, signer, connectMetaMask }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}

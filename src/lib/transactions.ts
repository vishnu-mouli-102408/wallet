import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { formatEther } from "ethers";

const SOLANA_RPC_URL = "https://solana-devnet.g.alchemy.com/v2";
const ETHEREUM_RPC_URL = "https://eth-sepolia.g.alchemy.com/v2";

export const getSolanaWalletBalance = async (publicKey: PublicKey) => {
	try {
		const url = `${SOLANA_RPC_URL}/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
		const connection = new Connection(url, "confirmed");
		const balance = await connection.getBalance(publicKey);
		return balance / LAMPORTS_PER_SOL;
	} catch (error) {
		console.error("Error getting solana wallet balance", error);
		toast.error("Error getting solana wallet balance", {
			description: "Please try again. Contact support if you need help.",
		});
		return null;
	}
};

export const getEthereumWalletBalance = async (address: string) => {
	try {
		const payload = {
			jsonrpc: "2.0",
			id: 1,
			method: "eth_getBalance",
			params: [address, "latest"],
		};
		const url = `${ETHEREUM_RPC_URL}/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
		const data = await response.json();
		console.log("DATA", data);
		const result = formatEther(data.result);
		return result;
	} catch (error) {
		console.error("Error getting ethereum wallet balance", error);
		toast.error("Error getting ethereum wallet balance", {
			description: "Please try again. Contact support if you need help.",
		});
		return null;
	}
};

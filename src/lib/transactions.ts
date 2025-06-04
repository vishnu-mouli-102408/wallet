import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
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

function hexToUint8Array(hex: string): Uint8Array {
	if (hex.length % 2 !== 0) {
		throw new Error("Invalid hex string");
	}
	const arr = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		arr[i / 2] = parseInt(hex.slice(i, i + 2), 16);
	}
	return arr;
}

export const sendSolanaTransaction = async (receiverPublicKey: PublicKey, amount: number, senderSecretKey: string) => {
	try {
		const url = `${SOLANA_RPC_URL}/${import.meta.env.VITE_ALCHEMY_API_KEY}`;
		const connection = new Connection(url, "confirmed");
		const secretKey = hexToUint8Array(senderSecretKey);
		const secret = Keypair.fromSecretKey(secretKey);
		const senderPublicKey = secret.publicKey;
		const balance = await connection.getBalance(senderPublicKey);
		const lamportsToSend = amount * LAMPORTS_PER_SOL;
		if (balance < lamportsToSend) {
			return {
				data: null,
				success: false,
				message: "Insufficient balance",
			};
		}
		const latestBlockhash = await connection.getLatestBlockhash();
		const transaction = new Transaction({
			recentBlockhash: latestBlockhash.blockhash,
			feePayer: senderPublicKey,
		}).add(
			SystemProgram.transfer({
				fromPubkey: senderPublicKey,
				toPubkey: receiverPublicKey,
				lamports: lamportsToSend,
			})
		);
		transaction.sign(secret);
		const rawTx = transaction.serialize();
		const signature = await connection.sendRawTransaction(rawTx);
		// Manual polling loop for confirmation
		let confirmed = false;
		for (let attempt = 0; attempt < 10; attempt++) {
			const status = await connection.getSignatureStatus(signature);
			const confirmedStatus = status.value;

			if (
				confirmedStatus &&
				(confirmedStatus.confirmationStatus === "confirmed" || confirmedStatus.confirmationStatus === "finalized")
			) {
				confirmed = true;
				break;
			}
			// wait 1s before retry
			await new Promise((res) => setTimeout(res, 1000));
		}
		if (confirmed) {
			console.log("✅ Transaction was processed successfully!");
			return {
				data: signature,
				success: true,
				message: "Transaction sent successfully",
			};
		} else {
			console.warn("⚠️ Transaction may have been sent but not confirmed in time.");
			return {
				data: signature,
				success: false,
				message: "Transaction sent but not confirmed in time",
			};
		}
	} catch (error) {
		console.error("❌ Error sending solana transaction", error);
		return {
			data: null,
			success: false,
			message: error instanceof Error ? error.message : "Error sending solana transaction",
		};
	}
};

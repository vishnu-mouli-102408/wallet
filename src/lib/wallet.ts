import CryptoJS from "crypto-js";
import { generatePublicPrivateKeyPair } from "./utils";
import { toast } from "sonner";

// Types
type SolanaKeyPair = {
	address: string;
	privateKey: string;
	walletNumber: number;
	network: "solana";
};

type EthereumKeyPair = {
	address: string;
	privateKey: string;
	walletNumber: number;
	network: "ethereum";
};

type WalletData = {
	solana: SolanaKeyPair[];
	ethereum: EthereumKeyPair[];
};

export interface Wallet {
	id: string;
	name: string;
	network: string;
	balance: string;
	address: string;
	networkIcon: string;
	privateKey: string;
}

export interface Network {
	id: string;
	name: string;
	symbol: string;
	icon: string;
	description: string;
	isTestnet?: boolean;
}

// Constants
const STORAGE_KEY = "walletData";

// Helper: Get next wallet number
function getNextWalletNumber(keyPairs: { walletNumber: number }[]): number {
	if (keyPairs.length === 0) return 1;
	const max = Math.max(...keyPairs.map((kp) => kp.walletNumber));
	return max + 1;
}

// 🔒 Save Wallet Data (encrypted)
export function saveWalletData(walletData: WalletData, password: string): void {
	const stringData = JSON.stringify(walletData);
	const encrypted = CryptoJS.AES.encrypt(stringData, password).toString();
	localStorage.setItem(STORAGE_KEY, encrypted);
}

// 🔑 Load Wallet Data (decrypted)
export function loadWalletData(password: string): WalletData | null {
	const encrypted = localStorage.getItem(STORAGE_KEY);
	if (!encrypted) {
		return { solana: [], ethereum: [] };
	}

	try {
		const decrypted = CryptoJS.AES.decrypt(encrypted, password).toString(CryptoJS.enc.Utf8);
		return JSON.parse(decrypted) as WalletData;
	} catch (err) {
		console.error("Error loading wallet data:", err);
		return null;
	}
}

// ➕ Add Solana KeyPair
export function addSolanaKeyPair(address: string, privateKey: string, password: string): void {
	const data = loadWalletData(password) || { solana: [], ethereum: [] };
	const walletNumber = getNextWalletNumber(data.solana);
	data.solana.push({ address, privateKey, walletNumber, network: "solana" });
	saveWalletData(data, password);
}

export function addSolanaWallet() {
	const storedPassword = localStorage.getItem("password");
	if (!storedPassword) {
		toast.error("No password found", {
			description: "Please create a password to add a wallet. Contact support if you need help.",
		});
		return;
	}
	const data = loadWalletData(storedPassword) || { solana: [], ethereum: [] };
	const walletNumber = getNextWalletNumber(data.solana);
	const keypair = generatePublicPrivateKeyPair("solana", walletNumber);
	addSolanaKeyPair(keypair.publicKey, keypair.privateKey, storedPassword);
}

// ➕ Add Ethereum KeyPair
export function addEthereumKeyPair(address: string, privateKey: string, password: string): void {
	const data = loadWalletData(password) || { solana: [], ethereum: [] };
	const walletNumber = getNextWalletNumber(data.ethereum);
	data.ethereum.push({ address, privateKey, walletNumber, network: "ethereum" });
	saveWalletData(data, password);
}

export function addEthereumWallet() {
	const storedPassword = localStorage.getItem("password");
	if (!storedPassword) {
		toast.error("No password found", {
			description: "Please create a password to add a wallet. Contact support if you need help.",
		});
		return;
	}
	const data = loadWalletData(storedPassword) || { solana: [], ethereum: [] };
	const walletNumber = getNextWalletNumber(data.ethereum);
	const keypair = generatePublicPrivateKeyPair("ethereum", walletNumber);
	addEthereumKeyPair(keypair.publicKey, keypair.privateKey, storedPassword);
}

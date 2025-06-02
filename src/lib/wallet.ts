import CryptoJS from "crypto-js";

// Types
type SolanaKeyPair = {
	address: string;
	privateKey: string;
	walletNumber: number;
};

type EthereumKeyPair = {
	address: string;
	privateKey: string;
	walletNumber: number;
};

type WalletData = {
	solana: SolanaKeyPair[];
	ethereum: EthereumKeyPair[];
};

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
	data.solana.push({ address, privateKey, walletNumber });
	saveWalletData(data, password);
}

// ➕ Add Ethereum KeyPair
export function addEthereumKeyPair(address: string, privateKey: string, password: string): void {
	const data = loadWalletData(password) || { solana: [], ethereum: [] };
	const walletNumber = getNextWalletNumber(data.ethereum);
	data.ethereum.push({ address, privateKey, walletNumber });
	saveWalletData(data, password);
}

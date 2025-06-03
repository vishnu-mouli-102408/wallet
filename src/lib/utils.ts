import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath as deriveEd25519Path } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair as SolanaKeypair } from "@solana/web3.js";
import { HDNodeWallet } from "ethers";
import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

export type Network = "solana" | "ethereum";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateMnemonicWords() {
	const words = generateMnemonic(128);
	const seedPhrase = mnemonicToSeedSync(words).toString("hex");
	return { words: words.split(" "), seedPhrase };
}

export const generatePublicPrivateKeyPair = (type: Network, index: number) => {
	try {
		const seed = localStorage.getItem("seedPhrase");
		const seedBuffer = Buffer.from(seed || "", "hex");
		if (!seed) {
			toast.error("No seed phrase found", {
				description: "Please create a seed phrase to add a wallet. Contact support if you need help.",
			});
			return null;
		}

		// Solana uses ed25519
		if (type === "solana") {
			const path = `m/44'/501'/${index}'/0'`;
			const derivedSeed = deriveEd25519Path(path, seed).key;
			const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
			const keypair = SolanaKeypair.fromSecretKey(secret);
			return {
				publicKey: keypair.publicKey.toBase58(),
				privateKey: Buffer.from(keypair.secretKey).toString("hex"),
			};
		}

		// Ethereum uses secp256k1 (ethers)
		if (type === "ethereum") {
			const hdNode = HDNodeWallet.fromSeed(seedBuffer);
			const path = `m/44'/60'/0'/0/${index}`;
			const wallet = hdNode.derivePath(path);

			return {
				publicKey: wallet.publicKey,
				privateKey: wallet.privateKey,
				address: wallet.address,
			};
		}
	} catch (error) {
		console.error("Error generating public private key pair", error);
		toast.error("Error generating public private key pair", {
			description: "Please try again. Contact support if you need help.",
		});
		return null;
	}
};

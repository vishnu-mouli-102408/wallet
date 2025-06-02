import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateMnemonic, mnemonicToSeedSync } from "bip39";
import { derivePath } from "ed25519-hd-key";
import nacl from "tweetnacl";
import { Keypair } from "@solana/web3.js";
import type { Network } from "@/store";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateMnemonicWords() {
	const words = generateMnemonic(128);
	const seedPhrase = mnemonicToSeedSync(words);
	return { words: words.split(" "), seedPhrase };
}

export const generatePublicPrivateKeyPair = (type: Network, index: number) => {
	const seed = localStorage.getItem("seedPhrase");
	if (!seed) throw new Error("Seed phrase not found");
	const path = `m/44'/${type === "solana" ? 501 : 60}'/${index}'/0'`;
	const derivedSeed = derivePath(path, seed).key;
	const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
	const keypair = Keypair.fromSecretKey(secret);
	const publicKey = keypair.publicKey.toBase58();
	const privateKey = Buffer.from(keypair.secretKey).toString("hex");
	return { publicKey, privateKey };
};

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { generateMnemonic } from "bip39";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function generateMnemonicWords() {
	const words = generateMnemonic(128);
	return words.split(" ");
}

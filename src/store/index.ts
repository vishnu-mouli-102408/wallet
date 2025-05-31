import { create } from "zustand";

export type Network = "ethereum" | "solana";

interface GlobalStore {
	selectedNetwork: Network;
	password: string;
	confirmPassword: string;
	actions: {
		setSelectedNetwork: (network: Network) => void;
		setPassword: (password: string) => void;
		setConfirmPassword: (password: string) => void;
	};
}

const globalStore = create<GlobalStore>((set) => ({
	selectedNetwork: "solana",
	password: "",
	confirmPassword: "",
	actions: {
		setSelectedNetwork: (network) => set({ selectedNetwork: network }),
		setPassword: (password) => set({ password }),
		setConfirmPassword: (password) => set({ confirmPassword: password }),
	},
}));

export const useNetwork = () => globalStore((state) => state.selectedNetwork);
export const usePassword = () => globalStore((state) => state.password);
export const useConfirmPassword = () => globalStore((state) => state.confirmPassword);
export const useGlobalActions = () => globalStore((state) => state.actions);

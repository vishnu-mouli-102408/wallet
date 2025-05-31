import { create } from "zustand";

export type Network = "ethereum" | "solana";

interface GlobalStore {
	selectedNetwork: Network;
	actions: {
		setSelectedNetwork: (network: Network) => void;
	};
}

const globalStore = create<GlobalStore>((set) => ({
	selectedNetwork: "solana",
	actions: {
		setSelectedNetwork: (network) => set({ selectedNetwork: network }),
	},
}));

export const useNetwork = () => globalStore((state) => state.selectedNetwork);
export const useGlobalActions = () => globalStore((state) => state.actions);

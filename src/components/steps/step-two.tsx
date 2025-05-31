import { motion } from "motion/react";
import { Checkbox } from "../ui/checkbox";
import { useGlobalActions, useNetwork, type Network } from "@/store";

const StepTwo = () => {
	const { setSelectedNetwork } = useGlobalActions();
	const selectedNetwork = useNetwork();

	const handleNetworkChange = (network: Network) => {
		setSelectedNetwork(network);
	};

	return (
		<motion.div
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -30 }}
			transition={{ duration: 0.4 }}
		>
			<h1 className="text-3xl font-bold text-white mb-3">Set up your Network</h1>
			<p className="text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-semibold mb-6">
				Select the network you want to use. You can change this later.
			</p>
			<div className="grid grid-cols-1 mb-6 gap-6">
				<motion.div
					onClick={() => {
						handleNetworkChange("solana");
					}}
					className="w-full bg-gray-800/80 cursor-pointer rounded-lg p-4 flex items-center gap-2"
					whileHover={{
						scale: 1.01,
						backgroundColor: "rgba(31, 41, 55, 0.9)",
						transition: { duration: 0.2 },
					}}
					whileTap={{ scale: 0.98 }}
				>
					<Checkbox id="solana" className="border-white" checked={selectedNetwork === "solana"} />
					<p className="text-white font-bold text-lg">Solana</p>
				</motion.div>
				<motion.div
					onClick={() => {
						handleNetworkChange("ethereum");
					}}
					className="w-full bg-gray-800/80 cursor-pointer rounded-lg p-4 flex items-center gap-2"
					whileHover={{
						scale: 1.01,
						backgroundColor: "rgba(31, 41, 55, 0.9)",
						transition: { duration: 0.2 },
					}}
					whileTap={{ scale: 0.98 }}
				>
					<Checkbox id="ethereum" className="border-white" checked={selectedNetwork === "ethereum"} />
					<p className="text-white font-bold text-lg">Ethereum</p>
				</motion.div>
			</div>
		</motion.div>
	);
};

export default StepTwo;

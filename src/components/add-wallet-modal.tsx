import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus } from "lucide-react";
import type { Network } from "@/lib/wallet";

const networks: Network[] = [
	{
		id: "ethereum",
		name: "Ethereum",
		symbol: "ETH",
		icon: "🔷",
		description: "Ethereum Mainnet",
	},
	{
		id: "solana",
		name: "Solana",
		symbol: "SOL",
		icon: "🟣",
		description: "Solana Mainnet",
	},
];

interface AddWalletModalProps {
	onClose: () => void;
	onSelectNetwork: (network: Network) => void;
}

export const AddWalletModal: React.FC<AddWalletModalProps> = ({ onClose, onSelectNetwork }) => {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredNetworks = networks.filter(
		(network) =>
			network.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			network.symbol.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
			>
				<motion.div
					className="bg-gray-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[80vh] overflow-hidden border border-gray-800"
					initial={{ y: 100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 100, opacity: 0 }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="p-6 pb-4 border-b border-gray-800">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold text-white">Add Wallet</h2>
							<motion.button
								onClick={onClose}
								className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<X className="w-4 h-4 text-gray-400" />
							</motion.button>
						</div>

						{/* Search */}
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="text"
								placeholder="Search networks..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
							/>
						</div>
					</div>

					{/* Networks List */}
					<div className="overflow-y-auto max-h-96">
						<div className="p-6 pt-4">
							<div className="space-y-2">
								{filteredNetworks.map((network, index) => (
									<motion.button
										key={network.id}
										onClick={() => onSelectNetwork(network)}
										className="w-full p-4 bg-black/30 hover:bg-black/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-200 text-left"
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.99 }}
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<div className="text-2xl">{network.icon}</div>
												<div>
													<div className="text-white font-medium">{network.name}</div>
													<div className="text-gray-400 text-sm">{network.description}</div>
												</div>
											</div>
											<div className="flex items-center space-x-2">
												<span className="text-gray-400 text-sm">{network.symbol}</span>
												<Plus className="w-4 h-4 text-gray-400" />
											</div>
										</div>
									</motion.button>
								))}
							</div>

							{filteredNetworks.length === 0 && (
								<div className="text-center py-8">
									<div className="text-gray-400 mb-2">No networks found</div>
									<div className="text-gray-500 text-sm">Try adjusting your search terms</div>
								</div>
							)}
						</div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

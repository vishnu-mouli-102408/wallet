import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { Wallet } from "@/lib/wallet";

interface WalletCardProps {
	wallet: Wallet;
	isSelected: boolean;
	onClick: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ wallet, isSelected, onClick }) => {
	return (
		<motion.div
			onClick={onClick}
			className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
				isSelected ? "bg-purple-500/10 border-purple-500/30" : "bg-gray-900/30 border-gray-800 hover:bg-gray-900/50"
			}`}
			whileHover={{ scale: 1.01 }}
			whileTap={{ scale: 0.99 }}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="text-2xl">{wallet.networkIcon}</div>
					<div>
						<div className="text-white capitalize font-medium text-sm">{wallet.name}</div>
						<div className="text-gray-400 text-xs capitalize">{wallet.network}</div>
					</div>
				</div>

				<div className="flex items-center space-x-3">
					{isSelected && (
						<motion.div
							className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ duration: 0.2 }}
						>
							<Check className="w-3 h-3 text-white" />
						</motion.div>
					)}
				</div>
			</div>
		</motion.div>
	);
};

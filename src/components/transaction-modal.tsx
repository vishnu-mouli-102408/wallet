import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Loader2, X } from "lucide-react";
import type { Wallet } from "@/lib/wallet";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { sendSolanaTransaction } from "@/lib/transactions";
import { PublicKey } from "@solana/web3.js";

interface TransactionModalProps {
	onClose: () => void;
	selectedWallet: Wallet;
	getBalance: () => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ onClose, selectedWallet, getBalance }) => {
	const [amount, setAmount] = useState<number | null>(null);
	const [address, setAddress] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [addressError, setAddressError] = useState<string | null>(null);

	const isValidSolanaAddress = (address: string) => {
		return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
	};

	const isValidEthAddress = (address: string) => {
		return /^0x[a-fA-F0-9]{40}$/.test(address);
	};
	const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const inputValue = e.target.value;
		setAddress(inputValue);

		// Clear error if input is empty
		if (!inputValue) {
			setAddressError(null);
			return;
		}

		if (selectedWallet.network === "solana") {
			// validate solana public key address
			if (!isValidSolanaAddress(inputValue)) {
				setAddressError("Invalid Solana address");
			} else {
				setAddressError(null);
			}
		} else if (selectedWallet.network === "ethereum") {
			// validate eth address
			if (!isValidEthAddress(inputValue)) {
				setAddressError("Invalid Ethereum address");
			} else {
				setAddressError(null);
			}
		}
	};

	const handleSendTransaction = async () => {
		try {
			if (!amount || amount <= 0) {
				toast.error("Please enter a valid amount");
				return;
			}
			if (!address) {
				toast.error("Please enter a valid address");
			}
			setIsLoading(true);
			if (selectedWallet.network === "solana") {
				const result = await sendSolanaTransaction(new PublicKey(address), amount, selectedWallet.privateKey);
				if (result.success) {
					toast.success("Transaction sent successfully", {
						description: "Transaction sent successfully",
					});
					onClose();
					await getBalance();
				} else {
					toast.error(result.message, {
						description: "Please try again. Contact support if you need help.",
					});
				}
			}
		} catch (error) {
			console.error("Error sending transaction", error);
			toast.error("Error sending transaction", {
				description: "Please try again. Contact support if you need help.",
			});
		} finally {
			setIsLoading(false);
		}
	};

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
							<h2 className="text-xl font-semibold capitalize text-white">{selectedWallet.network} Transaction</h2>
							<motion.button
								onClick={onClose}
								className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center"
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<X className="w-4 h-4 text-gray-400" />
							</motion.button>
						</div>
					</div>

					{/* Networks List */}
					<div className="overflow-y-auto max-h-96">
						<div className="p-6 pt-4 flex flex-col gap-4">
							<div className="flex flex-col">
								<Input
									id="address"
									type={"text"}
									value={address}
									onChange={(e) => {
										handleAddressChange(e);
									}}
									placeholder="Enter the address"
									className="bg-gray-700/50 border-gray-600 h-12 text-lg pl-4 pr-12 text-white placeholder:text-gray-400"
								/>
								{addressError && <p className="text-red-500 text-sm mt-1">{addressError}</p>}
							</div>
							<Input
								id="amount"
								type={"number"}
								value={amount ?? ""}
								pattern="^[0-9]*\.?[0-9]*$"
								step="any"
								onChange={(e) => {
									setAmount(Number(e.target.value));
								}}
								placeholder="Enter the amount"
								className="bg-gray-700/50 border-gray-600 h-12 text-lg pl-4 pr-12 text-white placeholder:text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							/>
							<Button
								onClick={handleSendTransaction}
								className="w-full bg-blue-600 text-white hover:bg-blue-700"
								size="lg"
								disabled={isLoading}
							>
								{isLoading ? (
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<ArrowLeftRight className="w-4 h-4 mr-2" />
								)}
								Send Transaction
							</Button>
						</div>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

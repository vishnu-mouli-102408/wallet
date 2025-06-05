import { ArrowDownLeft, ArrowUpRight, Check, Copy, Eye, EyeOff, Plus, QrCode, Send } from "lucide-react";

import { motion } from "motion/react";

import { Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AddWalletModal } from "./add-wallet-modal";
import { WalletCard } from "./wallet-card";
import { addEthereumWallet, addSolanaWallet, loadWalletData, type Network, type Wallet } from "@/lib/wallet";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { toast } from "sonner";
import { getEthereumWalletBalance, getSolanaWalletBalance } from "@/lib/transactions";
import { PublicKey } from "@solana/web3.js";
import { TransactionModal } from "./transaction-modal";

const HomeScreen = () => {
	const [showNetworkSelector, setShowNetworkSelector] = useState(false);
	const [showTransactionModal, setShowTransactionModal] = useState(false);
	const [wallets, setWallets] = useState<Wallet[]>([]);
	const [selectedWalletId, setSelectedWalletId] = useState<string>("");
	const selectedWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0];
	const [isBalanceVisible, setIsBalanceVisible] = useState(true);
	const [isCopied, setIsCopied] = useState(false);
	const [balance, setBalance] = useState<number>(0);
	const [isBalanceLoading, setIsBalanceLoading] = useState(false);
	const [isPrivateKeyVisible, setIsPrivateKeyVisible] = useState(false);
	const [isPrivateKeyCopied, setIsPrivateKeyCopied] = useState(false);

	const copyAddress = () => {
		navigator.clipboard.writeText(selectedWallet.address);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	const copyPrivateKey = () => {
		navigator.clipboard.writeText(selectedWallet.privateKey);
		setIsPrivateKeyCopied(true);
		setTimeout(() => setIsPrivateKeyCopied(false), 2000);
	};

	const getBalance = useCallback(async () => {
		try {
			setBalance(0);
			if (!selectedWallet) return;
			setIsBalanceLoading(true);
			if (selectedWallet.network === "solana") {
				const balance = await getSolanaWalletBalance(new PublicKey(selectedWallet.address));
				setBalance(Number(balance?.toFixed(2) ?? 0));
			} else if (selectedWallet.network === "ethereum") {
				const balance = await getEthereumWalletBalance(selectedWallet.address);
				const refactoredBalance = Number(balance ?? 0).toFixed(5);
				setBalance(Number(refactoredBalance));
			}
		} catch (error) {
			console.error("Error fetching balance:", error);
		} finally {
			setIsBalanceLoading(false);
		}
	}, [selectedWallet]);

	useEffect(() => {
		getBalance();
	}, [getBalance]);

	useEffect(() => {
		const password = localStorage.getItem("password") ?? "PASSWORD";
		const wallets = loadWalletData(password);
		const refactoredWallets = [...(wallets?.solana || []), ...(wallets?.ethereum || [])];
		setWallets(
			refactoredWallets?.map((wallet) => ({
				address: wallet.address,
				id: wallet.address,
				name:
					wallet.network === "solana"
						? "Solana Wallet " + wallet.walletNumber
						: "Ethereum Wallet " + wallet.walletNumber,
				network: wallet.network,
				networkIcon: wallet.network === "solana" ? "🟣" : "🔷",
				privateKey: wallet.privateKey,
			}))
		);
		setSelectedWalletId(refactoredWallets[0].address);
	}, []);

	const handleAddWallet = (network: Network) => {
		if (network.id === "solana") {
			addSolanaWallet();
		} else if (network.id === "ethereum") {
			addEthereumWallet();
		}
		setShowNetworkSelector(false);
		const password = localStorage.getItem("password");
		if (!password) {
			toast.error("No password found", {
				description: "Please create a password to add a wallet. Contact support if you need help.",
			});
			return;
		}
		const wallets = loadWalletData(password);
		const refactoredWallets = [...(wallets?.solana || []), ...(wallets?.ethereum || [])];
		setWallets(
			refactoredWallets?.map((wallet) => ({
				address: wallet.address,
				id: wallet.address,
				name:
					wallet.network === "solana"
						? "Solana Wallet " + wallet.walletNumber
						: "Ethereum Wallet " + wallet.walletNumber,
				network: wallet.network,
				networkIcon: wallet.network === "solana" ? "🟣" : "🔷",
				privateKey: wallet.privateKey,
			}))
		);
		toast.success("Wallet added successfully");
	};

	console.log("WALLETS", wallets);
	console.log("BALANCE", balance);

	if (wallets.length === 0) {
		return (
			<div className="h-full flex items-center justify-center">
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-white text-xl font-semibold">No wallets found</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col justify-between p-4">
			<div>
				<motion.div
					className="flex items-center justify-between mb-6"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="flex items-center space-x-3">
						<div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-sm">W</span>
						</div>
						<h1 className="text-white text-xl font-semibold">Wallet</h1>
					</div>

					<div className="flex items-center space-x-2">
						<motion.button
							className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<QrCode className="w-4 h-4 text-gray-400" />
						</motion.button>
						<motion.button
							className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Settings className="w-4 h-4 text-gray-400" />
						</motion.button>
					</div>
				</motion.div>
				<motion.div
					className="mb-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<div className="flex items-center justify-between mb-4">
						<span className="text-gray-400 text-sm">Active Wallet</span>
						<motion.button
							onClick={() => setShowNetworkSelector(true)}
							className="flex items-center space-x-1 text-purple-400 text-sm"
							whileHover={{ scale: 1.05 }}
						>
							<Plus className="w-4 h-4" />
							<span>Add Wallet</span>
						</motion.button>
					</div>

					<Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
						<SelectTrigger size="default" className="bg-black border-gray-800 mb-4 w-full text-white">
							<div className="flex items-center space-x-3 w-full">
								<span className="text-xl">{selectedWallet.networkIcon}</span>
								<div className="text-left">
									<div className="text-white capitalize font-medium text-sm">{selectedWallet.name}</div>
								</div>
							</div>
						</SelectTrigger>
						<SelectContent className="bg-black border-gray-800 w-full">
							{wallets.map((wallet) => (
								<SelectItem
									key={wallet.id}
									value={wallet.id}
									className="text-white cursor-pointer focus:bg-gray-900 w-full"
								>
									<div className="flex items-center space-x-3">
										<span className="text-xl">{wallet.networkIcon}</span>
										<div>
											<div className="text-white capitalize font-medium text-sm">{wallet.name}</div>
											<div className="text-gray-400 text-xs capitalize">{wallet.network}</div>
										</div>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<WalletCard wallet={selectedWallet} isSelected={true} onClick={() => {}} />
				</motion.div>
				<motion.div
					className="bg-black border border-gray-800 rounded-2xl p-6 mb-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<div className="text-center">
						<div className="flex items-center justify-center mb-2">
							<h2 className="text-gray-400 text-sm mr-2">Balance</h2>
							<motion.button
								onClick={() => setIsBalanceVisible(!isBalanceVisible)}
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								{isBalanceVisible ? (
									<Eye className="w-4 h-4 text-gray-400" />
								) : (
									<EyeOff className="w-4 h-4 text-gray-400" />
								)}
							</motion.button>
						</div>

						<div className="mb-2">
							{isBalanceVisible ? (
								<span className="text-3xl font-bold text-white">
									{isBalanceLoading ? (
										<div className="flex items-center justify-center">
											<div className="h-8 w-32 bg-gray-700 animate-pulse rounded"></div>
										</div>
									) : (
										<>
											{balance} {selectedWallet.network === "solana" ? "SOL" : "ETH"}
										</>
									)}
								</span>
							) : (
								<span className="text-3xl font-bold text-white">****</span>
							)}
						</div>

						<div className="flex items-center justify-center space-x-2 mb-4">
							<span className="text-gray-400 text-sm">
								{selectedWallet.address.slice(0, 6)}...{selectedWallet.address.slice(-4)}
							</span>
							<motion.button
								onClick={copyAddress}
								className="text-gray-400 hover:text-white"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								{isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
							</motion.button>
						</div>

						<div className="flex items-center justify-center gap-4">
							<span className="text-blue-500 text-sm">Private Key</span>
							{isPrivateKeyVisible ? (
								<span className="text-sm text-gray-400">
									{selectedWallet.privateKey.slice(0, 6)}...{selectedWallet.privateKey.slice(-4)}
								</span>
							) : (
								<span className="text-sm mt-1 text-gray-400">**************</span>
							)}
							<motion.button
								onClick={() => setIsPrivateKeyVisible(!isPrivateKeyVisible)}
								className="text-gray-400 hover:text-white ml-2"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								{isPrivateKeyVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
							</motion.button>
							<motion.button
								onClick={copyPrivateKey}
								className="text-gray-400 hover:text-white"
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								{isPrivateKeyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
							</motion.button>
						</div>
					</div>
				</motion.div>
			</div>
			<motion.div
				className="grid grid-cols-3 gap-4"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
			>
				<motion.button
					className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-4 flex flex-col items-center space-y-2"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => setShowTransactionModal(true)}
				>
					<Send className="w-6 h-6 text-white" />
					<span className="text-white text-sm font-medium">Send</span>
				</motion.button>

				<motion.button
					className="bg-black border border-gray-800 rounded-xl p-4 flex flex-col items-center space-y-2"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => {
						toast.info("Coming soon");
					}}
				>
					<ArrowDownLeft className="w-6 h-6 text-white" />
					<span className="text-white text-sm font-medium">Receive</span>
				</motion.button>

				<motion.button
					className="bg-black border border-gray-800 rounded-xl p-4 flex flex-col items-center space-y-2"
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={() => {
						toast.info("Coming soon");
					}}
				>
					<ArrowUpRight className="w-6 h-6 text-white" />
					<span className="text-white text-sm font-medium">Swap</span>
				</motion.button>
			</motion.div>
			{showNetworkSelector && (
				<AddWalletModal
					onClose={() => setShowNetworkSelector(false)}
					onSelectNetwork={(network) => {
						handleAddWallet(network);
					}}
				/>
			)}
			{showTransactionModal && (
				<TransactionModal
					getBalance={getBalance}
					selectedWallet={selectedWallet}
					onClose={() => setShowTransactionModal(false)}
				/>
			)}
		</div>
	);
};

export default HomeScreen;

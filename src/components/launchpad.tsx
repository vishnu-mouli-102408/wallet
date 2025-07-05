import { motion } from "motion/react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Wallet, Coins, Copy, RefreshCw, Check } from "lucide-react";
import { loadWalletData, type Wallet as WalletType } from "@/lib/wallet";
import { hexToUint8Array } from "@/lib/transactions";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Textarea } from "./ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createToken } from "@/lib/token";
import {
	createAssociatedTokenAccountInstruction,
	createInitializeMetadataPointerInstruction,
	createInitializeMintInstruction,
	createMintToInstruction,
	ExtensionType,
	getAssociatedTokenAddressSync,
	getMintLen,
	getTokenMetadata,
	LENGTH_SIZE,
	TOKEN_2022_PROGRAM_ID,
	TYPE_SIZE,
} from "@solana/spl-token";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";

// Types for Solana tokens
interface SolanaToken {
	mint: string;
	symbol: string;
	supply: number;
	name: string;
}

const createTokenFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	symbol: z.string().min(1, "Symbol is required"),
	decimals: z.number().min(6, "Decimals must be between 6 and 9").max(9, "Decimals must be between 6 and 9"),
	supply: z.string().min(1, "Supply is required"),
	description: z.string().optional(),
});

type CreateTokenForm = z.infer<typeof createTokenFormSchema>;

const Launchpad = () => {
	const [tokens, setTokens] = useState<SolanaToken[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showCreateToken, setShowCreateToken] = useState(false);
	const [selectedWalletOption, setSelectedWalletOption] = useState<"connect" | "select">("connect");

	const { connection } = useConnection();
	const wallet = useWallet();

	// React Hook Form setup with Zod validation
	const form = useForm<CreateTokenForm>({
		resolver: zodResolver(createTokenFormSchema),
		defaultValues: {
			name: "",
			symbol: "",
			decimals: 9,
			supply: "",
			description: "",
		},
	});

	const formatAddress = (address: string) => {
		return `${address.slice(0, 4)}...${address.slice(-4)}`;
	};

	const handleCreateTokenBySelectedWallet = async (data: CreateTokenForm) => {
		const parsedData = createTokenFormSchema.safeParse(data);
		if (!parsedData.success) {
			toast.error(parsedData.error.message);
			return;
		}

		console.log("Parsed Data", parsedData);

		if (!selectedWallet) {
			toast.error("Please select a wallet first");
			return;
		}

		setIsLoading(true);
		try {
			const token = await createToken({
				decimals: parsedData?.data?.decimals,
				payerSecret: hexToUint8Array(selectedWallet?.privateKey),
				tokenDescription: parsedData?.data?.description ?? "",
				tokenName: parsedData?.data?.name,
				tokenSymbol: parsedData?.data?.symbol,
				tokenSupply: Number(parsedData?.data?.supply),
			});
			console.log("CREATED TOKEN", token);
			if (token?.success) {
				setShowCreateToken(false);
				form.reset();
				await loadTokens();
				toast.success(token?.message);
			} else {
				toast.error("Oops! Something went wrong", {
					description: "There was an error creating the token. Please try again.",
				});
			}
		} catch (error) {
			console.error("Error creating token:", error);
			toast.error("Failed to create token", {
				description: "There was an error creating the token. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateTokenByConnectedWallet = async (data: CreateTokenForm) => {
		const parsedData = createTokenFormSchema.safeParse(data);
		if (!parsedData.success) {
			toast.error(parsedData.error.message);
			return;
		}

		if (!wallet?.publicKey) {
			toast.warning("Please connect your wallet to create a token");
			return;
		}

		console.log("Parsed Data", parsedData);
		try {
			setIsLoading(true);
			// Create a new mint
			const mintKeypair = Keypair.generate();
			// Create a new metadata pointer
			const metadata = {
				mint: mintKeypair.publicKey,
				name: parsedData?.data?.name,
				symbol: parsedData?.data?.symbol,
				uri: "https://res.cloudinary.com/dmlghnnuk/image/upload/v1742748575/expert-link/vjpwbxpumorw8dybdpnx.jpg",
				additionalMetadata: [],
			};
			// Get the mint length and metadata length
			const mintLen = getMintLen([ExtensionType.MetadataPointer]);
			const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
			// Get the minimum balance for rent exemption
			const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
			// Create a new transaction
			const transaction = new Transaction().add(
				SystemProgram.createAccount({
					fromPubkey: wallet.publicKey,
					newAccountPubkey: mintKeypair.publicKey,
					space: mintLen,
					lamports,
					programId: TOKEN_2022_PROGRAM_ID,
				}),
				// Initialize the metadata pointer
				createInitializeMetadataPointerInstruction(
					mintKeypair.publicKey,
					wallet.publicKey,
					mintKeypair.publicKey,
					TOKEN_2022_PROGRAM_ID
				),
				// Initialize the mint
				createInitializeMintInstruction(mintKeypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
				// Initialize the metadata
				createInitializeInstruction({
					programId: TOKEN_2022_PROGRAM_ID,
					mint: mintKeypair.publicKey,
					metadata: mintKeypair.publicKey,
					name: metadata.name,
					symbol: metadata.symbol,
					uri: metadata.uri,
					mintAuthority: wallet.publicKey,
					updateAuthority: wallet.publicKey,
				})
			);
			// Set the fee payer
			transaction.feePayer = wallet.publicKey;
			// Set the recent blockhash
			transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
			// Sign the transaction
			transaction.partialSign(mintKeypair);
			// Send the transaction
			await wallet.sendTransaction(transaction, connection);
			console.log(`Token mint created at ${mintKeypair.publicKey.toBase58()}`);
			// Get the associated token address
			const associatedToken = getAssociatedTokenAddressSync(
				mintKeypair.publicKey,
				wallet.publicKey,
				false,
				TOKEN_2022_PROGRAM_ID
			);

			console.log("Associated Token", associatedToken.toBase58());

			// Create a new transaction for the associated token account
			const transaction2 = new Transaction().add(
				createAssociatedTokenAccountInstruction(
					wallet.publicKey,
					associatedToken,
					wallet.publicKey,
					mintKeypair.publicKey,
					TOKEN_2022_PROGRAM_ID
				)
			);

			// Send the transaction
			await wallet.sendTransaction(transaction2, connection);

			// Get the amount to mint
			const amount = BigInt(parsedData?.data?.supply) * BigInt(10 ** parsedData?.data?.decimals);

			// Create a new transaction for the mint
			const transaction3 = new Transaction().add(
				createMintToInstruction(
					mintKeypair.publicKey,
					associatedToken,
					wallet.publicKey,
					amount,
					[],
					TOKEN_2022_PROGRAM_ID
				)
			);

			// Send the transaction
			await wallet.sendTransaction(transaction3, connection);
			console.log("Minted!");

			setShowCreateToken(false);
			form.reset();
			toast.success("Token created successfully");
			await loadTokens();
		} catch (error) {
			console.error("Error creating token:", error);
			toast.error("Failed to create token", {
				description: "There was an error creating the token. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (data: CreateTokenForm) => {
		if (selectedWalletOption === "connect") {
			handleCreateTokenByConnectedWallet(data);
		} else {
			handleCreateTokenBySelectedWallet(data);
		}
	};

	const [isCopied, setIsCopied] = useState<string | null>(null);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setIsCopied(text);
		setTimeout(() => setIsCopied(null), 2000);
	};

	const [wallets, setWallets] = useState<WalletType[]>([]);
	const [selectedWalletId, setSelectedWalletId] = useState<string>("");
	const selectedWallet = wallets.find((w) => w.id === selectedWalletId) || wallets[0];

	const loadTokens = useCallback(async () => {
		if (!selectedWallet) return;

		setIsLoading(true);
		try {
			// const tokens = await getSolanaTokens(new PublicKey(selectedWallet?.address));
			// Get the tokens
			const tokens = await connection.getParsedTokenAccountsByOwner(new PublicKey(selectedWallet.address), {
				programId: TOKEN_2022_PROGRAM_ID,
			});

			// Get the balances
			const balances = tokens?.value?.map(async (accountInfo) => {
				const buffer = accountInfo.account.data;
				const decoded = buffer;
				const mint = decoded.parsed.info.mint as string;
				const supply = Number(decoded.parsed.info.tokenAmount.amount) / LAMPORTS_PER_SOL;
				const metadata = await getTokenMetadata(connection, new PublicKey(mint));
				console.log("Metadata", metadata);
				const symbol = metadata?.symbol ?? "Unknown";
				const name = metadata?.name ?? "Unknown";

				return {
					mint,
					supply,
					symbol,
					name,
				};
			});
			// Wait for all promises to resolve before setting tokens
			const resolvedBalances = await Promise.all(balances ?? []);
			setTokens(resolvedBalances);
			console.log("Balances", resolvedBalances);
		} catch (error) {
			console.error("Error loading tokens:", error);
			toast.error("Failed to load tokens");
		} finally {
			setIsLoading(false);
		}
	}, [connection, selectedWallet]);

	useEffect(() => {
		loadTokens();
	}, [loadTokens, selectedWallet]);

	// console.log("Wallet", wallet.publicKey?.toBase58());

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

	console.log("Selected Wallet", selectedWallet);
	console.log("Tokens", tokens);

	return (
		<div className="h-full flex flex-col  p-6 space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
						<Coins className="w-5 h-5 text-white" />
					</div>
					<div>
						<h1 className="text-white text-2xl font-bold">Token Launchpad</h1>
						<p className="text-gray-400 text-sm">Manage your Solana tokens</p>
					</div>
				</div>
				<div className="flex items-center space-x-2">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline" size="sm" onClick={loadTokens} disabled={isLoading}>
								<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Refresh</p>
						</TooltipContent>
					</Tooltip>
					<Dialog
						open={showCreateToken}
						onOpenChange={(open) => {
							setShowCreateToken(open);
							if (!open) {
								form.reset();
							}
						}}
					>
						<DialogTrigger>
							<Tooltip>
								<TooltipTrigger>
									<Button
										size={"sm"}
										className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
									>
										<Plus className="w-4 h-4" />
									</Button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>Create Token</p>
								</TooltipContent>
							</Tooltip>
						</DialogTrigger>
						<DialogContent className="bg-black border-zinc-800 text-white max-w-md shadow-2xl">
							<DialogHeader className="border-b border-zinc-800 pb-4">
								<DialogTitle className="text-xl font-bold text-white">Create New Token</DialogTitle>
								<DialogDescription className="text-zinc-400 mt-2">
									Launch a new SPL token on Solana. You will need to pay a small fee to create the token.
								</DialogDescription>
							</DialogHeader>
							<Form {...form}>
								<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-sm font-semibold text-zinc-200">Token Name *</FormLabel>
													<FormControl>
														<Input
															{...field}
															placeholder="My Awesome Token"
															className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 transition-colors"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="symbol"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-sm font-semibold text-zinc-200">Symbol *</FormLabel>
													<FormControl>
														<Input
															{...field}
															placeholder="MAT"
															className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 transition-colors"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<FormField
											control={form.control}
											name="supply"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-sm font-semibold text-zinc-200">Total Supply *</FormLabel>
													<FormControl>
														<Input
															{...field}
															placeholder="1000000000"
															type="number"
															className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 transition-colors"
														/>
													</FormControl>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name="decimals"
											render={({ field }) => (
												<FormItem>
													<FormLabel className="text-sm font-semibold text-zinc-200">Decimals</FormLabel>
													<Select
														onValueChange={(value) => field.onChange(parseInt(value))}
														defaultValue={field.value.toString()}
													>
														<FormControl>
															<SelectTrigger className="bg-zinc-900 w-full border-zinc-700 text-white focus:border-purple-500 focus:ring-purple-500/20 transition-colors">
																<SelectValue />
															</SelectTrigger>
														</FormControl>
														<SelectContent className="bg-zinc-900 border-zinc-700">
															<SelectItem value="6" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
																6 (USDC style)
															</SelectItem>
															<SelectItem value="9" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
																9 (SOL style)
															</SelectItem>
															<SelectItem value="5" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
																5 (BONK style)
															</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage className="text-red-400" />
												</FormItem>
											)}
										/>
									</div>

									<FormField
										control={form.control}
										name="description"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-sm font-semibold text-zinc-200">Description</FormLabel>
												<FormControl>
													<Textarea
														{...field}
														placeholder="Token description..."
														rows={4}
														className="bg-zinc-900 h-24 border-zinc-700 text-white placeholder-zinc-500 focus:border-purple-500 focus:ring-purple-500/20 transition-colors"
													/>
												</FormControl>
												<FormMessage className="text-red-400" />
											</FormItem>
										)}
									/>

									<div className="flex space-x-3 pt-4 border-t border-zinc-800">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												setShowCreateToken(false);
												form.reset();
											}}
											className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
										>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={isLoading}
											className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
										>
											{isLoading ? "Creating..." : "Create Token"}
										</Button>
									</div>
								</form>
							</Form>
						</DialogContent>
					</Dialog>
				</div>
			</div>
			{/* Wallet Selection */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
				className="mb-4"
			>
				<Card className="bg-gray-900/50 border-gray-800">
					<CardHeader className="p-4">
						<div className="flex items-center justify-between">
							<CardTitle className="text-white flex items-center">
								<Wallet className="w-5 h-5 mr-2" />
								Select Wallet
							</CardTitle>
							<div className="flex items-center space-x-2">
								<span className="text-gray-400 text-xs">Connect</span>
								<Switch
									checked={selectedWalletOption === "select"}
									onCheckedChange={() =>
										setSelectedWalletOption(selectedWalletOption === "select" ? "connect" : "select")
									}
									className="data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-gray-600"
								/>
								<span className="text-gray-400 text-xs">Select</span>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						{selectedWalletOption === "select" ? (
							// Show Wallet Dropdown
							<div className="flex items-center space-x-3">
								{wallets.length === 0 ? (
									<div className="text-center py-4 flex-1">
										<Wallet className="w-8 h-8 text-gray-500 mx-auto mb-2" />
										<p className="text-gray-400 text-sm">No wallets found</p>
									</div>
								) : (
									<Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
										<SelectTrigger className="bg-black border-gray-800 text-white flex-1">
											<div className="flex items-center space-x-3">
												<span className="text-xl">{selectedWallet?.networkIcon || "🟣"}</span>
												<div className="text-left">
													<div className="text-white capitalize font-medium text-sm">
														{selectedWallet?.name || "Select wallet"}
													</div>
												</div>
											</div>
										</SelectTrigger>
										<SelectContent className="bg-black border-gray-800">
											{wallets
												.filter((wallet) => wallet.network === "solana")
												.map((wallet) => (
													<SelectItem
														key={wallet.id}
														value={wallet.id}
														className="text-white cursor-pointer focus:bg-gray-900"
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
								)}
							</div>
						) : (
							<div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
								<WalletMultiButton
									style={{
										borderRadius: "14px",
										padding: "10px 20px",
										fontSize: "14px",
										backgroundColor: "#944ced",
									}}
								/>
								<WalletDisconnectButton style={{ borderRadius: "14px", padding: "10px 20px", fontSize: "14px" }} />
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>

			<div className="flex-1 overflow-y-auto">
				{/* Token List */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="flex-1"
				>
					<Card className="bg-gray-900/50 border-gray-800 h-full">
						<CardHeader>
							<CardTitle className="text-white flex items-center justify-between">
								<div className="flex items-center">
									<Coins className="w-5 h-5 mr-2" />
									Tokens ({tokens.length})
								</div>
								{selectedWallet && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button variant="ghost" size="sm" onClick={() => copyToClipboard(selectedWallet.address)}>
													{isCopied === selectedWallet?.address ? (
														<Check className="w-4 h-4" />
													) : (
														<Copy className="w-4 h-4" />
													)}
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Copy wallet address</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}
							</CardTitle>
							<CardDescription className="text-gray-400">
								{selectedWallet
									? `Showing tokens for ${formatAddress(selectedWallet.address)}`
									: "Select a wallet to view tokens"}
							</CardDescription>
						</CardHeader>
						<CardContent>
							{!selectedWallet ? (
								<div className="text-center py-12">
									<Coins className="w-16 h-16 text-gray-500 mx-auto mb-4" />
									<p className="text-gray-400 text-lg">Select a wallet to view tokens</p>
								</div>
							) : isLoading ? (
								<div className="text-center py-12">
									<RefreshCw className="w-8 h-8 text-gray-500 mx-auto mb-4 animate-spin" />
									<p className="text-gray-400">Loading tokens...</p>
								</div>
							) : tokens.length === 0 ? (
								<div className="text-center py-12">
									<Coins className="w-16 h-16 text-gray-500 mx-auto mb-4" />
									<p className="text-gray-400 text-lg">No tokens found</p>
									<p className="text-gray-500 text-sm">Create your first token to get started</p>
								</div>
							) : (
								<div className="space-y-4">
									{tokens.map((token) => (
										<Card
											key={token.mint}
											className="bg-[#181e29] border border-[#23293a] rounded-xl px-4 py-3 flex items-center justify-between"
										>
											{/* Left: Icon + Info */}
											<div className="flex items-center space-x-3 min-w-0">
												<div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#8b5cf6] to-[#2563eb]">
													<Coins className="w-4 h-4 text-white" />
												</div>
												<div className="min-w-0">
													<div className="flex items-center space-x-2">
														<span className="text-white font-semibold text-base">{token.name}</span>
														<span className="bg-[#2d2346] text-[#b39ddb] text-[10px] px-2 py-0.5 rounded font-medium">
															{token.symbol}
														</span>
													</div>
													<div className="flex items-center space-x-1 mt-0.5">
														<span className="text-[#b0b8c9] text-xs font-mono truncate">
															{formatAddress(token.mint)}
														</span>
														<button
															onClick={() => copyToClipboard(token.mint)}
															className="ml-1 p-0.5 hover:bg-[#23293a] rounded"
														>
															{isCopied === token.mint ? (
																<Check className="w-3 h-3 text-[#b39ddb]" />
															) : (
																<Copy className="w-3 h-3 text-[#b0b8c9]" />
															)}
														</button>
													</div>
												</div>
											</div>
											{/* Right: Balance */}
											<div className="flex flex-col items-end">
												<span className="text-[#b0b8c9] text-xs font-medium mb-0.5">Balance</span>
												<span className="text-white font-bold text-lg leading-none">
													{token.supply.toLocaleString()}
												</span>
											</div>
										</Card>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
};

export default Launchpad;

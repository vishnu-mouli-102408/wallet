/* eslint-disable @typescript-eslint/no-explicit-any */
import { useConnection } from "@solana/wallet-adapter-react";
import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	Transaction,
	VersionedTransaction,
	sendAndConfirmTransaction,
} from "@solana/web3.js";
import axios from "axios";
import bs58 from "bs58";
import Decimal from "decimal.js";

import { API_URLS, DEVNET_PROGRAM_ID, Raydium, TxVersion } from "@raydium-io/raydium-sdk-v2";

const Swap = () => {
	const { connection } = useConnection();

	const owner = Keypair.fromSecretKey(
		bs58.decode("3dwETAbQcfJcoKV572ekp8qJT1MrGKELaJL8iVMWQ4iJuwsPeMPtnyx9SEAJwgHzr8k3t3vwwUMUYtSi4mRQsN2o")
	);

	const inputMint = "So11111111111111111111111111111111111111112";
	const outputMint = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
	const amount = 1 * LAMPORTS_PER_SOL;
	const slippage = 1;
	// const txVersion = "V0";
	const isInputSol = true;
	const isOutputSol = false;
	const txVersion = "LEGACY"; // ✅ tell API to give legacy tx
	const isV0Tx = false; // ✅ deserialize as Transaction.from()

	const handleSwap = async () => {
		try {
			const raydium = await Raydium.load({
				owner,
				connection,
				cluster: "devnet",
				disableFeatureCheck: true,
				disableLoadToken: true,
				blockhashCommitment: "finalized",
			});

			// RAY
			const mint1 = await raydium.token.getTokenInfo("So11111111111111111111111111111111111111112");
			// USDT
			const mint2 = await raydium.token.getTokenInfo("EmXq3Ni9gfudTiyNKzzYvpnQqnJEMRw2ttnVXoJXjLo1");

			const clmmConfigs = await raydium.api.getClmmConfigs();

			console.log("MINT1", mint1);
			console.log("MINT2", mint2);

			const { execute } = await raydium.clmm.createPool({
				// programId: CLMM_PROGRAM_ID,
				programId: DEVNET_PROGRAM_ID.CLMM_PROGRAM_ID,
				mint1,
				mint2,
				ammConfig: { ...clmmConfigs[0], id: new PublicKey(clmmConfigs[0].id), fundOwner: "", description: "" },
				initialPrice: new Decimal(1),
				txVersion: TxVersion.V0,

				// optional: set up priority fee here
				// computeBudgetConfig: {
				//   units: 600000,
				//   microLamports: 46591500,
				// },
			});

			const { txId } = await execute({ sendAndConfirm: true });
			console.log("clmm pool created:", { txId: `https://explorer.solana.com/tx/${txId}` });

			// get statistical transaction fee from API
			/**
			 * vh: very high
			 * h: high
			 * m: medium
			 */
			const { data } = await axios.get<{
				id: string;
				success: boolean;
				data: { default: { vh: number; h: number; m: number } };
			}>(`${API_URLS.BASE_HOST}${API_URLS.PRIORITY_FEE}`);

			//fetch quote
			const { data: swapResponse } = await axios.get<any>(
				`${
					API_URLS.SWAP_HOST
				}/compute/swap-base-in?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${
					slippage * 100
				}&txVersion=${txVersion}`
			); // Use the URL xxx/swap-base-in or xxx/swap-base-out to define the swap type.

			//fetch transactions
			const { data: swapTransactions } = await axios.post<{
				id: string;
				version: string;
				success: boolean;
				data: { transaction: string }[];
			}>(`${API_URLS.SWAP_HOST}/transaction/swap-base-in`, {
				computeUnitPriceMicroLamports: String(data.data.default.h),
				swapResponse,
				txVersion,
				wallet: owner.publicKey.toBase58(),
				wrapSol: isInputSol,
				unwrapSol: isOutputSol, // true means output mint receive sol, false means output mint received wsol
				makeTxVersion: 0,
				overrideLookupTableAccounts: [],
			});

			console.log("swapTransactions", swapTransactions);

			const allTxBuf = swapTransactions?.data?.map((tx) => Buffer.from(tx.transaction, "base64"));
			const allTransactions = allTxBuf.map((txBuf) =>
				isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)
			);

			console.log(`total ${allTransactions.length} transactions`, swapTransactions);

			let idx = 0;
			if (!isV0Tx) {
				for (const tx of allTransactions) {
					console.log(`${++idx} transaction sending...`);
					const transaction = tx as Transaction;
					transaction.sign(owner);
					const txId = await sendAndConfirmTransaction(connection, transaction, [owner], { skipPreflight: true });
					console.log(`${++idx} transaction confirmed, txId: ${txId}`);
				}
			} else {
				for (const tx of allTransactions) {
					idx++;
					const transaction = tx as VersionedTransaction;
					transaction.sign([owner]);
					const txId = await connection.sendTransaction(tx as VersionedTransaction, { skipPreflight: true });
					const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash({
						commitment: "finalized",
					});
					console.log("lastValidBlockHeight", lastValidBlockHeight);
					console.log("blockhash", blockhash);

					console.log(`${idx} transaction sending..., txId: ${txId}`);
					console.log("🔍http://solscan.io/tx/" + txId);
					//   await connection.confirmTransaction(
					//     {
					//       blockhash,
					//       lastValidBlockHeight,
					//       signature: txId,
					//     },
					//     'confirmed'
					//   )
					//  console.log(`${idx} transaction confirmed`)
				}
			}
		} catch (error) {
			console.log("error", error);
		}
	};
	return (
		<div onClick={handleSwap} className="h-full flex flex-col  p-6 space-y-6">
			Swap
		</div>
	);
};

export default Swap;

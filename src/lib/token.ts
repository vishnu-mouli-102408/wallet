import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createMint, getAccount, getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

const SOLANA_RPC_URL = "https://api.devnet.solana.com";
export function loadWallet(secretKey: Uint8Array): Keypair {
	return Keypair.fromSecretKey(secretKey);
}

export async function createNewTokenMint({
	connection,
	payer,
	mintAuthority,
	freezeAuthority = null,
	decimals = 9,
}: {
	connection: Connection;
	payer: Keypair;
	mintAuthority: PublicKey;
	freezeAuthority?: PublicKey | null;
	decimals?: number;
}) {
	const mint = await createMint(
		connection,
		payer,
		mintAuthority,
		freezeAuthority,
		decimals,
		undefined // default to TOKEN_PROGRAM_ID
	);
	console.log("Mint created at", mint.toBase58());
	return mint;
}

export async function createTokenAccount({
	connection,
	payer,
	mint,
	owner,
}: {
	connection: Connection;
	payer: Keypair;
	mint: PublicKey;
	owner: PublicKey;
}) {
	const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, owner);
	return tokenAccount;
}

export async function mintTokens({
	connection,
	payer,
	mint,
	destination,
	authority,
	amount,
}: {
	connection: Connection;
	payer: Keypair;
	mint: PublicKey;
	destination: PublicKey;
	authority: Keypair;
	amount: number;
}) {
	const signature = await mintTo(connection, payer, mint, destination, authority, amount);
	return signature;
}

export async function getTokenBalance({
	connection,
	tokenAccountAddress,
}: {
	connection: Connection;
	tokenAccountAddress: PublicKey;
}) {
	const accountInfo = await getAccount(connection, tokenAccountAddress);
	return Number(accountInfo.amount);
}

interface CreateTokenPayload {
	payerSecret: Uint8Array;
	decimals: number;
	tokenName: string;
	tokenSymbol: string;
	tokenSupply: number;
	tokenDescription: string;
}

export async function createToken(payload: CreateTokenPayload) {
	try {
		const url = SOLANA_RPC_URL;
		const connection = new Connection(url, "confirmed");
		const payer = Keypair.fromSecretKey(payload.payerSecret);

		// STEP 1: Create new mint
		const mint = await createMint(
			connection,
			payer,
			payer.publicKey, // mint authority
			null, // no freeze authority
			payload.decimals
		);

		// STEP 2: Create associated token account
		const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, mint, payer.publicKey);

		// STEP 3: Mint initial supply (adjust for decimals)
		const amount = BigInt(payload.tokenSupply) * BigInt(10 ** payload.decimals);
		const signature = await mintTo(connection, payer, mint, tokenAccount.address, payer, amount);

		// STEP 4: Get final balance
		const accountInfo = await getAccount(connection, tokenAccount.address);
		const uiAmount = Number(accountInfo.amount) / 10 ** payload.decimals;

		return {
			data: {
				mintAddress: mint.toBase58(),
				tokenAccount: tokenAccount.address.toBase58(),
				signature,
				uiAmount,
				name: payload.tokenName,
				symbol: payload.tokenSymbol,
				decimals: payload.decimals,
			},
			success: true,
			message: "Token Created Successfully",
		};
	} catch (error) {
		console.error("Error creating token", error);
		return {
			data: null,
			success: false,
			message: "Erro Creating Token",
		};
	}
}

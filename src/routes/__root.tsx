import PasswordScreen from "@/components/password-screen";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const Root = () => {
	const [isUnlocked, setIsUnlocked] = useState(localStorage.getItem("isWalletUnlocked") === "true");

	useEffect(() => {
		const timeout = setTimeout(
			() => {
				if (isUnlocked) {
					localStorage.removeItem("isWalletUnlocked");
					setIsUnlocked(false);
				}
			},
			1000 * 60 * 60 * 24
		); // one day
		return () => clearTimeout(timeout);
	}, [isUnlocked]);

	// console.log("ISUNLOCKED", isUnlocked);

	if (!isUnlocked) {
		return (
			<div className="bg-black min-h-screen overflow-clip flex items-center justify-center">
				<motion.div
					className="bg-gray-900/50 backdrop-blur-lg rounded-3xl max-w-md w-full max-h-[80vh] h-[80vh] border border-gray-800 shadow-2xl mx-auto"
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
					id="home-container"
				>
					<PasswordScreen
						callback={() => {
							localStorage.setItem("isWalletUnlocked", "true");
							setIsUnlocked(true);
						}}
					/>
				</motion.div>
			</div>
		);
	}

	return (
		<ConnectionProvider endpoint={"https://api.devnet.solana.com"}>
			<WalletProvider wallets={[]} autoConnect>
				<WalletModalProvider>
					<Outlet />;
				</WalletModalProvider>
			</WalletProvider>
		</ConnectionProvider>
	);
};

export const Route = createRootRoute({
	component: Root,
});

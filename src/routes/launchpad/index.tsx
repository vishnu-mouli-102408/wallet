import Launchpad from "@/components/launchpad";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import "@solana/wallet-adapter-react-ui/styles.css";

export const Route = createFileRoute("/launchpad/")({
	component: RouteComponent,
});

function RouteComponent() {
	const isOnboardingFinished = localStorage.getItem("onboarding-finished");

	if (!isOnboardingFinished) {
		return <Navigate to="/onboarding" />;
	}

	return (
		<div className="bg-black min-h-screen overflow-clip flex items-center justify-center">
			<motion.div
				className="bg-gray-900/50 backdrop-blur-lg rounded-3xl max-w-md w-full max-h-[80vh] h-[80vh] border border-gray-800 shadow-2xl mx-auto"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.3 }}
				id="home-container"
			>
				<Launchpad />
			</motion.div>
		</div>
	);
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Lock, Globe, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import { Stepper } from "./stepper";
import StepOne from "./steps/step-one";
import StepTwo from "./steps/step-two";
import StepThree from "./steps/step-three";
import StepFour from "./steps/step-four";
import { useConfirmPassword, useNetwork } from "@/store";
import { usePassword } from "@/store";
import { generateMnemonicWords, generatePublicPrivateKeyPair } from "@/lib/utils";
import { useGlobalActions } from "@/store";
import { addEthereumKeyPair, addSolanaKeyPair } from "@/lib/wallet";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

const steps = ["Introduction", "Security", "Features", "Launch"];

const stepData = [
	{
		icon: Zap,
		title: "Lightning Fast",
		subtitle: "Welcome to the future of crypto",
		description: "Experience blazing-fast transactions with minimal fees. Built for the next generation of Web3 users.",
		gradient: "from-yellow-400 to-orange-500",
		bgGradient: "from-gray-800 to-gray-900",
		component: StepOne,
		buttonText: "Create New Wallet",
	},
	{
		icon: Globe,
		title: "Set up your wallet",
		subtitle: "Your assets, protected",
		description: "Create a new wallet or import an existing one. We'll help you get started with the basics.",
		gradient: "from-red-400 to-pink-500",
		bgGradient: "from-gray-800 to-gray-900",
		component: StepTwo,
		buttonText: "Setup Wallet",
	},
	{
		icon: Lock,
		title: "Set up a Password",
		subtitle: "Secure your wallet",
		description:
			"It's important to setup a password to secure your wallet. You'll need it to access your wallet later.",
		gradient: "from-blue-400 to-cyan-500",
		bgGradient: "from-gray-800 to-gray-900",
		component: StepThree,
		buttonText: "Next",
	},
	{
		icon: Sparkles,
		title: "Ready to Explore",
		subtitle: "Your journey begins now",
		description: "Welcome to Web3! Start exploring DeFi, NFTs, and decentralized applications with confidence.",
		gradient: "from-purple-400 to-indigo-500",
		bgGradient: "from-gray-800 to-gray-900",
		component: StepFour,
		buttonText: "Create New Wallet",
	},
];

export const OnboardingVariant: React.FC = () => {
	const navigate = useNavigate();
	const [currentStep, setCurrentStep] = useState(0);
	const { setMnemonicWords } = useGlobalActions();
	const network = useNetwork();
	const nextStep = async () => {
		if (currentStep === 2 && password && confirmPassword && password === confirmPassword) {
			// Hash password before storing in local storage
			const hashedPassword = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
			// Convert hash to base64 string
			const hashArray = Array.from(new Uint8Array(hashedPassword));
			const hashBase64 = btoa(hashArray.map((b) => String.fromCharCode(b)).join(""));
			localStorage.setItem("password", hashBase64);
			const { words, seedPhrase } = generateMnemonicWords();
			// store seed phrase in local storage
			localStorage.setItem("seedPhrase", seedPhrase);
			setMnemonicWords(words);
		}

		if (currentStep === 3) {
			const keypair = generatePublicPrivateKeyPair(network, 0);
			if (!keypair) {
				toast.error("No keypair found", {
					description: "Please create a seed phrase to add a wallet. Contact support if you need help.",
				});
				return;
			}
			const storedPassword = localStorage.getItem("password");
			if (!storedPassword) {
				toast.error("No password found", {
					description: "Please create a password to add a wallet. Contact support if you need help.",
				});
				return;
			}
			if (network === "solana") {
				addSolanaKeyPair(keypair.publicKey, keypair.privateKey, storedPassword);
			} else if (network === "ethereum") {
				addEthereumKeyPair(keypair?.address ?? keypair.publicKey, keypair.privateKey, storedPassword);
			}
			localStorage.setItem("onboarding-finished", "true");
			navigate({ to: "/" });
		}

		if (currentStep < steps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const password = usePassword();
	const confirmPassword = useConfirmPassword();

	const currentData = stepData[currentStep];
	const IconComponent = currentData.icon;
	const StepComponent = currentData.component;

	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-4">
			<div className="max-w-4xl w-full">
				<motion.div
					className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<div className="flex flex-col lg:flex-row">
						{/* Left side - Visual */}
						<div
							className={`lg:w-1/2 p-8 bg-gradient-to-br ${currentData.bgGradient} flex items-center justify-center`}
						>
							<AnimatePresence mode="wait">
								<motion.div
									key={currentStep}
									initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
									animate={{ opacity: 1, scale: 1, rotateY: 0 }}
									exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
									transition={{ duration: 0.5 }}
									className="text-center"
								>
									<motion.div
										className={`w-32 h-32 bg-gradient-to-r ${currentData.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}
										whileHover={{ scale: 1.1, rotate: 360 }}
										transition={{ duration: 0.6 }}
									>
										<IconComponent className="w-16 h-16 text-white" />
									</motion.div>

									<div className="space-y-4">
										{[...Array(3)].map((_, i) => (
											<motion.div
												key={i}
												className={`h-2 bg-gradient-to-r ${currentData.gradient} rounded-full opacity-20`}
												style={{ width: `${100 - i * 20}%` }}
												initial={{ scaleX: 0 }}
												animate={{ scaleX: 1 }}
												transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
											/>
										))}
									</div>
								</motion.div>
							</AnimatePresence>
						</div>

						{/* Right side - Content */}
						<div className="lg:w-1/2 p-8 flex  flex-col justify-between bg-black">
							<div>
								<Stepper steps={steps} currentStep={currentStep} variant="numbered" className="mb-8" />

								<AnimatePresence mode="wait">
									<StepComponent />
								</AnimatePresence>
							</div>

							<div className="flex space-x-4">
								{currentStep > 0 && (
									<motion.button
										onClick={prevStep}
										className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 border-gray-700 text-gray-300 hover:border-gray-600 hover:text-white transition-all duration-200"
										whileHover={{ scale: 1.01 }}
										whileTap={{ scale: 0.98 }}
									>
										<ArrowLeft className="w-4 h-4" />
										<span>Previous</span>
									</motion.button>
								)}

								<motion.button
									disabled={currentStep === 2 && (!password || !confirmPassword || password !== confirmPassword)}
									onClick={nextStep}
									className={`flex items-center justify-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r ${currentData.gradient} text-white hover:shadow-lg transition-all duration-200 ${
										currentStep === 0 ? "w-full" : "flex-1"
									} ${currentStep === 2 && (!password || !confirmPassword || password !== confirmPassword) ? "opacity-50 cursor-not-allowed" : ""}`}
									whileHover={
										currentStep === 2 && (!password || !confirmPassword || password !== confirmPassword)
											? {}
											: { scale: 1.01 }
									}
									whileTap={
										currentStep === 2 && (!password || !confirmPassword || password !== confirmPassword)
											? {}
											: { scale: 0.98 }
									}
								>
									<span>{currentData.buttonText}</span>
									<ArrowRight className="w-4 h-4" />
								</motion.button>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

import { motion } from "motion/react";
import { useMnemonicWords } from "@/store";

const StepFour = () => {
	const mnemonicWords = useMnemonicWords();

	return (
		<motion.div
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -30 }}
			transition={{ duration: 0.4 }}
		>
			<h1 className="text-3xl font-bold text-white mb-3">Your Secret Recovery Phrase</h1>
			<p className="text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-semibold mb-6">
				Save this phrase in a secure location.
			</p>
			<div className="grid grid-cols-1 gap-8 mb-8">
				<div className="relative">
					<div className="relative">
						<div className="grid grid-cols-3 gap-4">
							{mnemonicWords.map((word, index) => (
								<div key={index} className="bg-gray-800/80 rounded-lg p-2 text-lg text-center">
									{word}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</motion.div>
	);
};

export default StepFour;

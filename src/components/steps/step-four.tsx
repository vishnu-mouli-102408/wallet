import { motion } from "motion/react";
import { useMnemonicWords } from "@/store";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

const StepFour = () => {
	const mnemonicWords = useMnemonicWords();
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			setTimeout(() => {
				setCopied(false);
			}, 2000);
		}
	}, [copied]);

	return (
		<motion.div
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -30 }}
			transition={{ duration: 0.4 }}
		>
			<div className="flex flex-row items-center justify-between">
				<h1 className="text-3xl font-bold text-white mb-3">Your Secret Recovery Phrase</h1>
				<div
					onClick={() => {
						navigator.clipboard.writeText(mnemonicWords.join(" "));
						setCopied(true);
					}}
					className="flex flex-row cursor-pointer items-center justify-center hover:text-yellow-500 text-white"
				>
					{copied ? <Check className="w-4 h-4 text-yellow-500" /> : <Copy className="w-4 h-4 text-white" />}
				</div>
			</div>
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

import { motion } from "motion/react";

const StepOne = () => {
	return (
		<motion.div
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -30 }}
			transition={{ duration: 0.4 }}
		>
			<h1 className="text-3xl font-bold text-white mb-3">Lightning Fast</h1>
			<p
				className={`text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-semibold mb-4`}
			>
				Welcome to the future of crypto
			</p>
			<p className="text-gray-400 text-lg leading-relaxed mb-8">
				Experience blazing-fast transactions with minimal fees. Built for the next generation of Web3 users.
			</p>

			<div className="grid grid-cols-2 gap-4 mb-8">
				{["Secure", "Fast", "Reliable", "User-friendly"].map((feature, index) => (
					<motion.div
						key={feature}
						className="flex items-center space-x-2"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 + 0.4 }}
					>
						<div className={`w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full`} />
						<span className="text-gray-300 font-medium">{feature}</span>
					</motion.div>
				))}
			</div>
		</motion.div>
	);
};

export default StepOne;

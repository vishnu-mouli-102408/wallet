import { motion } from "motion/react";

const StepThree = () => {
	return (
		<motion.div
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -30 }}
			transition={{ duration: 0.4 }}
		>
			<h1 className="text-3xl font-bold text-white mb-3">Setup a Password</h1>
			<p className="text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-semibold mb-4">
				It's important to setup a password to secure your wallet. You'll need it to access your wallet later.
			</p>
		</motion.div>
	);
};

export default StepThree;

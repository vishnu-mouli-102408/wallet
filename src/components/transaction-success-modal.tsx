import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import * as motion from "motion/react-client";

interface TransactionSuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCloseTransactionModal: () => void;
}

const TransactionSuccessModal = ({ isOpen, onClose, onCloseTransactionModal }: TransactionSuccessModalProps) => {
	const [isVisible, setIsVisible] = useState(isOpen);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
		}
	}, [isOpen]);

	const handleClose = () => {
		onCloseTransactionModal();
		setIsVisible(false);
		setTimeout(() => {
			onClose();
		}, 500); // Wait for exit animation to complete
	};

	// Animation variants
	const backdropVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { duration: 0.3 } },
		exit: { opacity: 0, transition: { duration: 0.3 } },
	};

	const modalVariants = {
		hidden: { scale: 0.8, opacity: 0, y: 20 },
		visible: {
			scale: 1,
			opacity: 1,
			y: 0,
			transition: {
				type: "spring",
				damping: 25,
				stiffness: 300,
				delay: 0.1,
			},
		},
		exit: {
			scale: 0.8,
			opacity: 0,
			y: 20,
			transition: { duration: 0.3 },
		},
	};

	const checkmarkVariants = {
		hidden: { scale: 0, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				delay: 0.5,
				type: "spring",
				damping: 15,
				stiffness: 200,
			},
		},
	};

	const textVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				delay: 1.1,
				duration: 0.5,
			},
		},
	};

	if (!isOpen && !isVisible) return null;

	return (
		<motion.div
			className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-10 p-4 backdrop-blur"
			variants={backdropVariants}
			initial="hidden"
			animate={isVisible ? "visible" : "exit"}
			exit="exit"
		>
			<motion.div
				className="relative w-full max-w-sm rounded-xl border border-white/10 bg-gradient-to-b from-[#1c1c24] to-[#12151c] p-8 shadow-lg"
				variants={modalVariants}
				initial="hidden"
				animate={isVisible ? "visible" : "exit"}
				exit="exit"
			>
				<button
					onClick={handleClose}
					className="absolute right-4 top-4 cursor-pointer text-gray-400 transition-colors hover:text-white"
				>
					<X size={20} />
				</button>

				<div className="flex flex-col items-center">
					<motion.div
						className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-green-600"
						variants={checkmarkVariants}
						initial="hidden"
						animate="visible"
					>
						<Check className="text-white" size={32} />
					</motion.div>

					<motion.h2
						className="mb-2 text-2xl font-semibold text-white"
						variants={textVariants}
						initial="hidden"
						animate="visible"
					>
						Transaction Successful
					</motion.h2>

					<motion.p
						className="mb-4 text-center text-gray-300"
						variants={textVariants}
						initial="hidden"
						animate="visible"
					>
						Your transaction has been completed successfully.
					</motion.p>

					<motion.button
						className="mt-6 cursor-pointer rounded-md border border-white/10 bg-gradient-to-r from-[#403E43] to-[#221F26] px-8 py-2 text-white transition-opacity hover:opacity-90"
						onClick={handleClose}
						variants={textVariants}
						initial="hidden"
						animate="visible"
					>
						Continue
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default TransactionSuccessModal;

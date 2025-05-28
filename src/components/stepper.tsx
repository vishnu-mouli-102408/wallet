import { Fragment } from "react";
import { motion } from "motion/react";
import { Check } from "lucide-react";

interface StepperProps {
	steps: string[];
	currentStep: number;
	variant?: "dots" | "progress" | "numbered";
	className?: string;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, variant = "dots", className = "" }) => {
	if (variant === "progress") {
		return (
			<div className={`w-full ${className}`}>
				<div className="flex justify-between mb-2">
					<span className="text-sm text-gray-400">
						Step {currentStep + 1} of {steps.length}
					</span>
					<span className="text-sm text-gray-400">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
				</div>
				<div className="h-2 bg-gray-800 rounded-full overflow-hidden">
					<motion.div
						className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
						initial={{ width: 0 }}
						animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
						transition={{ duration: 0.5, ease: "easeInOut" }}
					/>
				</div>
			</div>
		);
	}

	if (variant === "numbered") {
		return (
			<div className={`flex items-center justify-center space-x-4 ${className}`}>
				{steps.map((_, index) => (
					<Fragment key={index}>
						<motion.div
							className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
								index < currentStep
									? "bg-green-500 border-green-500 text-white"
									: index === currentStep
									? "bg-purple-500 border-purple-500 text-white"
									: "bg-gray-800 border-gray-600 text-gray-400"
							}`}
							initial={{ scale: 0.8 }}
							animate={{ scale: index <= currentStep ? 1 : 0.8 }}
							transition={{ duration: 0.3 }}
						>
							{index < currentStep ? (
								<Check className="w-5 h-5" />
							) : (
								<span className="text-sm font-semibold">{index + 1}</span>
							)}
						</motion.div>
						{index < steps.length - 1 && (
							<div
								className={`h-0.5 w-8 transition-all duration-500 ${
									index < currentStep ? "bg-green-500" : "bg-gray-700"
								}`}
							/>
						)}
					</Fragment>
				))}
			</div>
		);
	}

	// Default dots variant
	return (
		<div className={`flex items-center justify-center space-x-3 ${className}`}>
			{steps.map((_, index) => (
				<motion.div
					key={index}
					className={`rounded-full transition-all duration-300 ${
						index === currentStep
							? "w-8 h-2 bg-purple-500"
							: index < currentStep
							? "w-2 h-2 bg-green-500"
							: "w-2 h-2 bg-gray-600"
					}`}
					initial={{ scale: 0.8 }}
					animate={{ scale: index <= currentStep ? 1 : 0.8 }}
					transition={{ duration: 0.3 }}
				/>
			))}
		</div>
	);
};

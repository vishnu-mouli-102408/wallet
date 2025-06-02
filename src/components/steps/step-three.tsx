import { motion } from "motion/react";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { useConfirmPassword, useGlobalActions, usePassword } from "@/store";

interface ValidationErrors {
	password?: string;
	confirmPassword?: string;
}

const StepThree = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [errors, setErrors] = useState<ValidationErrors>({});

	const { setPassword, setConfirmPassword } = useGlobalActions();
	const password = usePassword();
	const confirmPassword = useConfirmPassword();

	useEffect(() => {
		const password = localStorage.getItem("password");
		if (password) {
			localStorage.removeItem("password");
		}
	}, []);

	const validatePassword = (pass: string): string | undefined => {
		if (pass.length < 8) {
			return "Password must be at least 8 characters long";
		}
		if (!/[A-Za-z]/.test(pass)) {
			return "Password must contain at least one letter";
		}
		if (!/[0-9]/.test(pass)) {
			return "Password must contain at least one number";
		}
		if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
			return "Password must contain at least one special character";
		}
		return undefined;
	};

	useEffect(() => {
		const newErrors: ValidationErrors = {};

		// Validate password
		if (password) {
			const passwordError = validatePassword(password);
			if (passwordError) {
				newErrors.password = passwordError;
			}
		}

		// Validate confirm password
		if (confirmPassword && password !== confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
	}, [password, confirmPassword]);

	return (
		<motion.div
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -30 }}
			transition={{ duration: 0.4 }}
		>
			<h1 className="text-3xl font-bold text-white mb-3">Set up a Password</h1>
			<p className="text-lg bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent font-semibold mb-6">
				It's important to setup a password to secure your wallet. You'll need it to access your wallet later.
			</p>
			<div className="grid grid-cols-1 gap-8 mb-8">
				<div className="relative">
					<div className="relative">
						<Input
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Password"
							className={`bg-gray-800/80 h-12 text-lg pl-4 pr-12 ${errors.password ? "border-red-500" : ""}`}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
						>
							{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					{errors.password && <p className="text-red-500 text-sm mt-1 absolute">{errors.password}</p>}
				</div>
				<div className="relative">
					<div className="relative">
						<Input
							type={showConfirmPassword ? "text" : "password"}
							placeholder="Confirm Password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className={`bg-gray-800/80 h-12 text-lg pl-4 pr-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
						>
							{showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
						</button>
					</div>
					{errors.confirmPassword && <p className="text-red-500 text-sm mt-1 absolute">{errors.confirmPassword}</p>}
				</div>
			</div>
		</motion.div>
	);
};

export default StepThree;

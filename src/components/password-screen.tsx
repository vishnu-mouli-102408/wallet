import { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface PasswordScreenProps {
	setIsUnlocked: (isUnlocked: boolean) => void;
}

const PasswordScreen = ({ setIsUnlocked }: PasswordScreenProps) => {
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [showPassword, setShowPassword] = useState<boolean>(false);

	const handleUnlock = async () => {
		if (password.length < 8) {
			setError("Password must be at least 8 characters long");
			return;
		}
		try {
			setIsLoading(true);
			const storedPassword = localStorage.getItem("password");
			if (!storedPassword) {
				toast.error("No User Found", {
					description: "Please create an account first",
					duration: 3000,
					className: "bg-red-500 text-white",
				});
				return;
			}
			const hashedPassword = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
			const hashArray = Array.from(new Uint8Array(hashedPassword));
			const hashBase64 = btoa(hashArray.map((b) => String.fromCharCode(b)).join(""));
			if (hashBase64 === storedPassword) {
				setIsUnlocked(true);
			} else {
				setError("Invalid Password. Please try again.");
			}
		} catch (error) {
			console.error("Error unlocking wallet:", error);
			setError("Oops! Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main className="flex items-center justify-center h-full p-6">
			<Card className="w-full max-w-md bg-gray-800/50 border-gray-700 flex flex-col flex-1 justify-center">
				<CardHeader className="space-y-1">
					<div className="flex items-center justify-center mb-4">
						<Lock className="w-12 h-12 text-blue-500" />
					</div>
					<CardTitle className="text-2xl text-center text-white">Welcome Back</CardTitle>
					<CardDescription className="text-center text-gray-400">
						Enter your password to unlock your wallet
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2 relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => {
								setPassword(e.target.value);
								setError("");
							}}
							placeholder="Enter your password"
							className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
						/>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setShowPassword(!showPassword)}
							className={`absolute right-2 ${error ? "top-[30%]" : "top-1/2"} hover:bg-transparent hover:text-yellow-500 -translate-y-1/2`}
						>
							{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
						</Button>
						{error && <p className="text-sm text-red-500">{error}</p>}
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<Button
						onClick={handleUnlock}
						className="w-full bg-blue-600 text-white hover:bg-blue-700"
						size="lg"
						disabled={isLoading}
					>
						{isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Unlock className="w-4 h-4 mr-2" />}
						Unlock Wallet
					</Button>
				</CardFooter>
			</Card>
		</main>
	);
};

export default PasswordScreen;

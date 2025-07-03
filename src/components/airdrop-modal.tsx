import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { airdropSolana } from "@/lib/transactions";
import { PublicKey } from "@solana/web3.js";

interface AirdropModalProps {
	open: boolean;
	onClose: () => void;
	callback: () => Promise<void>;
}

const AirdropModal = ({ open, onClose, callback }: AirdropModalProps) => {
	const [address, setAddress] = useState("");
	const [amount, setAmount] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
			if (!address) {
				toast.error("Please enter a valid address");
				return;
			}
			if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || Number(amount) > 10) {
				toast.error("Please enter a valid amount");
				return;
			}
			setIsLoading(true);
			const signature = await airdropSolana(new PublicKey(address), Number(amount));
			console.log("SIGNATURE", signature);
			if (!signature) {
				toast.error("Oops! Something went wrong", {
					description: "There was an error airdropping SOL to the address. Please try again.",
				});
				return;
			}
			await callback();
			toast.success("Airdrop successful!");
			setIsLoading(false);
			setAddress("");
			setAmount("");
			onClose();
		} catch (error) {
			console.error("Error airdropping solana", error);
			toast.error("Oops! Something went wrong", {
				description: "There was an error airdropping SOL to the address. Please try again.",
			});
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogOverlay className="bg-black/50 backdrop-blur-md" />
			<DialogContent className="max-w-sm w-full rounded-2xl p-6 bg-background">
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-bold mb-2">Request Airdrop</DialogTitle>
					<p className="text-center text-muted-foreground text-sm mb-4">
						Send test tokens to any solana address instantly. <br />
						Note: This is a test airdrop and the tokens will not be real.
					</p>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
					<div>
						<label htmlFor="airdrop-address" className="block text-sm font-medium mb-1">
							Address
						</label>
						<Input
							id="airdrop-address"
							type="text"
							placeholder="Enter wallet address"
							value={address}
							onChange={(e) => setAddress(e.target.value)}
							className="h-10"
							autoComplete="off"
						/>
					</div>
					<div>
						<label htmlFor="airdrop-amount" className="block text-sm font-medium mb-1">
							Amount
						</label>
						<Input
							id="airdrop-amount"
							type="number"
							min={"0"}
							max={"10"}
							step="any"
							placeholder="Enter amount"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							className="h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
							autoComplete="off"
						/>
					</div>
					<Button type="submit" className="w-full mt-2" disabled={isLoading} size="lg">
						{isLoading ? "Airdropping..." : "Airdrop"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AirdropModal;

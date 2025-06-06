import Home from "@/components/home";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const isOnboardingFinished = localStorage.getItem("onboarding-finished");
	if (!isOnboardingFinished) {
		return <Navigate to="/onboarding" />;
	}
	return (
		<div className="">
			<Home />
		</div>
	);
}

import { OnboardingVariant } from "@/components/onboarding";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/onboarding/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <OnboardingVariant />;
}

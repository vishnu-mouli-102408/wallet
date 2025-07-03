import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Toaster } from "sonner";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const router = createRouter({ routeTree });

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<TooltipProvider delayDuration={0}>
				<ThemeProvider defaultTheme="dark" storageKey="wallet-theme">
					<RouterProvider router={router} />
					<Toaster closeButton position="bottom-center" theme="dark" richColors />
				</ThemeProvider>
			</TooltipProvider>
		</StrictMode>
	);
}

import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="wallet-theme">
			<h1>Stepper component</h1>
		</ThemeProvider>
	);
}

export default App;

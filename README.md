# Wallet

A modern, secure, and user-friendly cryptocurrency wallet built with React, TypeScript, and Vite. This wallet supports multiple blockchain networks and provides a seamless experience for managing digital assets.

## 🚀 Features

- Multi-chain support (Solana, Ethereum)
- Secure key management using BIP39
- Modern UI with Tailwind CSS
- Type-safe development with TypeScript
- State management with Zustand
- Client-side routing with TanStack Router

## 🛠️ Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**:
  - Radix UI
  - Lucide React (Icons)
- **State Management**: Zustand
- **Routing**: TanStack Router
- **Blockchain Integration**:
  - @solana/web3.js
  - ethers.js
- **Cryptography**:
  - bip39
  - tweetnacl
  - crypto-js
  - ed25519-hd-key

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/vishnu-mouli-102408/wallet.git
cd wallet
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

## 🏗️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔧 Configuration

The project uses several configuration files:

- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration
- `components.json` - Component configuration

## 🏗️ Project Structure

```
wallet/
├── src/              # Source files
├── public/           # Static assets
├── node_modules/     # Dependencies
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project metadata and dependencies
```

## 🔒 Security

This wallet implements several security measures:

- Secure key generation using BIP39
- Client-side encryption
- Secure storage of private keys
- Protection against common web vulnerabilities

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This wallet is for educational purposes. Always use at your own risk and never store large amounts of cryptocurrency in web-based wallets.

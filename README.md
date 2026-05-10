# BharatSwap Merchant Terminal

A professional Virtual Point of Sale (vPOS) terminal designed for merchants to accept USDC payments on the Base Sepolia testnet with real-time INR conversion.

## Technology Stack

- Core Framework: Next.js 15 (App Router)
- Web3 Integration: Thirdweb SDK
- P2P Protocol: P2P.me SDK (@p2pdotme/sdk)
- Blockchain Interaction: Viem
- UI/Animations: Framer Motion and Lucide React
- Styling: Tailwind CSS

## P2P.me SDK Integration

The terminal leverages the P2P.me SDK to handle the financial logic and protocol interactions:

1. Price Feeds (usePrices):
The application uses the SDK's price module to fetch the live on-chain exchange rate between INR and USDC. This ensures that the merchant always requests the correct amount of crypto based on the current market value.

2. Fee Configuration (useOrders):
The terminal integrates the getFeeConfig method to retrieve protocol fee structures. This allows the system to calculate any small-order fixed fees or percentage-based protocol costs before generating the payment QR code.

3. SdkProvider:
The entire application is wrapped in a centralized SdkProvider configured for the Base Sepolia network. This manages the connection to the Diamond contract (0xce868398fdadca368eac203222874d6888532ae2) and the official USDC contract.

4. Profile Management:
Uses the Profile module to monitor merchant balances and transaction limits directly from the P2P protocol facets.

## Local Development Setup

Follow these steps to set up the terminal on your local machine:

### 1. Clone the Repository
git clone https://github.com/anandsingh07/-p2p-merchant-terminal.git
cd -p2p-merchant-terminal

### 2. Install Dependencies
npm install

### 3. Environment Configuration
Create a .env.local file in the root directory and add your Thirdweb Client ID:
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

### 4. Run the Application
npm run dev

The terminal will be available at http://localhost:3000.

## Deployment and Network

The application is currently configured for the Base Sepolia Testnet (Chain ID: 84532). Ensure your wallet is connected to this network to view balances and receive transaction notifications.

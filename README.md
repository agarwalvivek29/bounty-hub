# BountyHub

> On-chain bounties for GitHub issues, powered by Base Network

[![Base Sepolia](https://img.shields.io/badge/Base-Sepolia-0052FF?logo=coinbase)](https://sepolia.basescan.org/address/0x96111652DB352b814697e79A846E8CD9C8e11196)
[![thirdweb](https://img.shields.io/badge/thirdweb-v5-purple)](https://thirdweb.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**BountyHub** bridges GitHub and Web3 — maintainers fund bounties for open-source issues directly from GitHub comments, contributors get paid automatically on-chain when their PR is merged.

🌐 **Live Demo:** [bounty-hub.vercel.app](https://bounty-hub.vercel.app)

---

## How It Works

```
GitHub Issue → /bounty comment → Smart Contract escrow
     ↑                                     ↓
Frontend Dashboard ←── thirdweb SDK ←── Base Sepolia
     ↑                                     ↓
Contributor claims      /reward comment → Payout + close
```

### 3 Steps

**1. Install the GitHub App**
Add BountyHub to your repository. The bot listens for slash commands in issue comments.

**2. Create a Bounty**
Comment `/bounty 0.5ETH` on any GitHub issue. The bot locks funds in the smart contract escrow and posts a confirmation with the transaction hash.

**3. Reward a Contributor**
When the work is done, comment `/reward @username`. The bot pays the contributor on-chain and closes the issue automatically.

---

## Bot Commands

| Command | Who | Description |
|---------|-----|-------------|
| `/bounty <amount>ETH` | Maintainer | Creates bounty, locks ETH in escrow |
| `/reward @username` | Maintainer | Pays contributor, closes issue |
| `/help` | Anyone | Lists available commands |

**Example:**
```
# On any GitHub issue:
> /bounty 0.25ETH

🤖 Bounty of 0.25ETH created!
Transaction: 0xabc...def
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, thirdweb v5 React SDK |
| Blockchain | Solidity smart contract on Base Sepolia (L2) |
| GitHub Bot | Node.js, Octokit Webhooks, GitHub App |
| Wallet | thirdweb ConnectButton (supports MetaMask, Coinbase, WalletConnect) |
| Chain | Base Sepolia (Chain ID: 84532) |

**Smart Contract:** [`0x96111652DB352b814697e79A846E8CD9C8e11196`](https://sepolia.basescan.org/address/0x96111652DB352b814697e79A846E8CD9C8e11196)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   GitHub Repository                  │
│  Issue Comment: /bounty 0.5ETH                      │
└──────────────────────┬──────────────────────────────┘
                       │ webhook
                       ▼
┌─────────────────────────────────────────────────────┐
│                  BountyHub Bot (gitbot/)             │
│  - Listens to issue_comment.created events          │
│  - Parses /bounty and /reward commands              │
│  - Calls smart contract via thirdweb SDK            │
│  - Posts confirmation comment with tx hash          │
└──────────────────────┬──────────────────────────────┘
                       │ on-chain tx
                       ▼
┌─────────────────────────────────────────────────────┐
│         Smart Contract (Base Sepolia)               │
│  - createBounty()   — locks ETH in escrow           │
│  - completeBounty() — releases ETH to contributor   │
│  - assignContributor()                              │
│  - getBounties() / getBountiesByMaintainer()        │
└──────────────────────┬──────────────────────────────┘
                       │ read via thirdweb
                       ▼
┌─────────────────────────────────────────────────────┐
│              Frontend (frontend/)                   │
│  /           — Landing page + live stats            │
│  /bounties   — Public bounty board                  │
│  /manager    — Maintainer dashboard (deposit, track)│
│  /contributer— Contributor dashboard (earnings)     │
└─────────────────────────────────────────────────────┘
```

---

## Setup

### Prerequisites
- Node.js 18+
- A [thirdweb](https://thirdweb.com) account (free) for `CLIENT_ID`
- A GitHub App (for the bot)
- A funded wallet on Base Sepolia

### Frontend (`frontend/`)

```bash
cd frontend
yarn install
```

Create `.env.local`:
```env
NEXT_PUBLIC_CLIENT_ID=your_thirdweb_client_id
```

```bash
yarn dev
# → http://localhost:3000
```

### GitHub Bot (`gitbot/`)

```bash
cd gitbot
npm install
```

Create `.env`:
```env
# GitHub App credentials
APP_ID=your_github_app_id
PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
WEBHOOK_SECRET=your_webhook_secret

# Blockchain
CLIENT_ID=your_thirdweb_client_id
WALLET_PRIVATE_KEY=0xyour_wallet_private_key

# Server
PORT=3000
HOST=localhost
```

```bash
npm run dev
# → Listening at http://localhost:3000/api/webhook
```

For local development, expose the webhook with [smee.io](https://smee.io) or [ngrok](https://ngrok.com).

### Install GitHub App

[**Install BountyHub on your repo →**](https://github.com/apps/tst-app-vivk/installations/new)

---

## Maintainer Flow

1. Connect wallet on [bounty-hub.vercel.app/manager](https://bounty-hub.vercel.app/manager)
2. Deposit ETH into the contract (funds pool for all your bounties)
3. Install the GitHub App on your repo
4. Comment `/bounty <amount>ETH` on any issue — funds are locked
5. When PR is merged, comment `/reward @contributor` — funds sent instantly

## Contributor Flow

1. Browse open bounties at [bounty-hub.vercel.app/bounties](https://bounty-hub.vercel.app/bounties)
2. Connect wallet on [bounty-hub.vercel.app/contributer](https://bounty-hub.vercel.app/contributer)
3. Pick an issue, submit your PR
4. Get rewarded automatically when the maintainer runs `/reward @you`

---

## Project Structure

```
bounty-hub/
├── frontend/           # Next.js app
│   └── src/app/
│       ├── page.tsx            # Landing page
│       ├── bounties/page.js    # Public bounty board
│       ├── manager/page.js     # Maintainer dashboard
│       ├── contributer/page.js # Contributor dashboard
│       ├── components/
│       │   ├── Home.jsx        # Landing page component
│       │   └── Navbar.tsx      # Navigation
│       └── constants/
│           └── contract.ts     # ABI
└── gitbot/             # GitHub webhook bot
    └── src/
        ├── index.ts            # Server entry
        ├── app.ts              # Webhook app setup
        ├── web3.ts             # Contract interactions
        └── handlers/           # Event handlers
            ├── handleIssueCommentCreated.ts
            ├── handleIssueAssigned.ts
            └── handleIssueClosed.ts
```

---

## License

MIT

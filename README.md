

## 1. Overview

**Project Name:** **VocaHire**
**Tagline:** _Hire voice-based AI agents that make real-world calls — pay them automatically in USDC on Arc._

**Goal:**
Build a **voice AI agent marketplace** where users can hire voice agents (built using **ElevenLabs Agents Platform**) to perform real-world tasks like scheduling, follow-ups, and sales calls.
Each agent gets paid in **USDC** via **Circle Wallets** and all payments are settled on **Arc**, Circle’s EVM-compatible blockchain with USDC as native gas.

The system integrates:

- **ElevenLabs Agent API** (for creating and managing AI voice agents)
- **Circle Wallets API** (for creating wallets for users and agents)
- **Circle Transfers API** (for automating USDC payments)
- **Arc Smart Contracts** (for on-chain escrow and transparency)
- **Next.js (TypeScript)** as the frontend + backend framework (App Router APIs)

---

## 2. Core Features

### 🧩 A. Agent Marketplace

- Users can browse available **voice agents** with their profiles (name, description, hourly/call rate, and voice type).
- Agents are backed by **ElevenLabs voice AI** models.
- Each agent has:

_ `elevenlabs_agent_id`
  _ `circle_wallet_id`
  _ `payout_address` (Arc address)
  _ `rate_per_call` in USDC

### 💬 B. Hire & Fund Jobs

- Users can hire an agent for a call task:

_ Select an agent.
  _ Specify a task (e.g., “Follow up with customer John at 10 AM”).
  \* Fund the job with USDC (either via Circle Wallets or on-chain escrow).

- Funds are locked in an **escrow smart contract** (`VoiceJobEscrow`) until the job is completed.

### 🔊 C. Voice Agent Execution

- The backend triggers the agent call using the **ElevenLabs Agent API**.
- The call outcome (success/failure) is sent to the system via **ElevenLabs Webhook**.

### 🔁 D. Automated Payouts

- Once the webhook confirms a call as **completed**, the backend:

1. Calls the **on-chain escrow contract** to release the USDC payment, OR
     2. Executes a **Circle Wallet transfer** (client → agent).

Both options are supported for demo flexibility.

### 📈 E. Dashboard & Transparency

- Users can view:

_ Their hired jobs, status, and USDC spent.
  _ Agents’ earnings and recent completed jobs.

- All payments are trackable on **Arc Explorer** (for on-chain escrow mode).

---

## 3. Architecture Overview

### 🔧 Components

| Component                                          | Description                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Frontend (Next.js)**                             | UI for users and agents; also contains API routes for backend logic                |
| **Smart Contracts (Solidity)**                     | Deployed on Arc Testnet — handle agent registration and escrow-based job payments  |
| **Circle APIs**                                    | Used for wallet creation, management, and transfers of USDC                        |
| **ElevenLabs Agent API**                           | Used for call initiation and receiving call-completion webhooks                    |
| **Database (SQLite / Prisma)**                     | Store mappings between agents, wallets, and jobs                                   |
| **Cloudflare Workers AI / Voice Logs (optional)**  | Used for recording/transcribing calls (future scope)                               |

---

## 4. System Flow

### 🔹 Step 1: Agent Registration

- The backend creates a **Circle Wallet** for each ElevenLabs agent.
- Stores:

_ `elevenlabs_agent_id`
  _ `circle_wallet_id`
  _ `payout_address` (Arc address of wallet)
  _ `metaURI` (JSON metadata)

- Registers agent on-chain in **VoiceAgentRegistry** smart contract.

### 🔹 Step 2: User Hires Agent

- User selects an agent and sets a budget (e.g., 5 USDC).
- User funds an escrow using:

_ **Circle Transfer API**, OR
  _ **on-chain transaction** (`openJob()`).

### 🔹 Step 3: Agent Executes Call

- ElevenLabs Agent Platform makes the voice call.
- On call completion, ElevenLabs sends a **webhook** to `/api/webhooks/elevenlabs`.

### 🔹 Step 4: Payment Release

- The backend verifies the webhook and:

_ Calls the smart contract function `markCompleted(jobId)` (if escrow mode).
  _ Or triggers Circle API `/transfers` (if wallet mode).

- Agent receives USDC instantly.

### 🔹 Step 5: Tracking & Analytics

- Job and payment details are stored in the database.
- Frontend shows:

_ Agent earnings
  _ Job history
  \* Arc Explorer links for transparency

---

## 5. Technologies

| Layer                   | Technology                                         |
| ----------------------- | -------------------------------------------------- |
| **Frontend**            | Next.js 14+, TypeScript, Tailwind, Shadcn UI       |
| **Blockchain**          | Solidity (v0.8.24) on Arc Testnet                  |
| **On-chain SDK**        | viem / ethers.js                                   |
| **Backend APIs**        | Next.js App Router API routes                      |
| **Wallets & Payments**  | Circle Wallets API, Circle Transfers API           |
| **AI Voice Agents**     | ElevenLabs Agent Platform (voice calls, webhooks)  |
| **Database**            | Prisma + SQLite/PostgreSQL                         |
| **Deployment**          | Vercel or Node server for webhook handling         |

---

## 6. Smart Contracts

### `VoiceAgentRegistry.sol`

Stores metadata and payout address of agents.

**Key Functions:**

- `upsertAgent(address payout, string metaURI, bool active)`
- `getPayout(address agentController)`
- `isActive(address agentController)`

---

### `VoiceJobEscrow.sol`

Handles job creation, fund locking, and payment release.

**Key Functions:**

- `openJob(address agentController, uint256 amount)`
- `markCompleted(uint256 jobId)` — callable only by `relayer` (backend)
- `cancel(uint256 jobId)` — refunds client if job not completed

**Events:**

- `JobOpened(uint256 id, address client, address agent, uint256 amount)`
- `JobCompleted(uint256 id, address agent, uint256 amount)`
- `JobCanceled(uint256 id)`

---

## 7. API Design (Next.js Routes)

### `/api/agents/register` — POST

Registers a new ElevenLabs agent and creates a Circle Wallet.

**Request:**

```json
{
  "elevenlabsAgentId": "agent_abc123",
  "metaURI": "https://example.com/agent-metadata.json"
}
```

**Response:**

```json
{
  "circleWalletId": "wlt_123",
  "payoutAddress": "0xABC...",
  "status": "registered"
}
```

---

### `/api/jobs/open` — POST

Creates a new job and returns contract + agent info.

**Request:**

```json
{
  "agentController": "0xAgentAddress",
  "amount": "5000000"
}
```

**Response:**

```json
{
  "usdc": "0xUSDC...",
  "escrow": "0xEscrow...",
  "agentController": "0xAgentAddress",
  "amount": "5000000"
}
```

---

### `/api/webhooks/elevenlabs` — POST

Triggered when ElevenLabs reports a completed call.

**Request:**

```json
{
  "jobId": 1,
  "agentController": "0xAgentAddress",
  "status": "completed",
  "callId": "call_123"
}
```

**Response:**

```json
{
  "ok": true,
  "tx": "0xTransactionHash"
}
```

---

### `/api/webhooks/elevenlabs-circle` — POST

Alternative webhook for Circle-only payout (no escrow).

**Request:**

```json
{
  "jobId": "job_123",
  "status": "completed"
}
```

**Response:**

```json
{
  "ok": true
}
```

---

## 9. Environment Variables

| Variable                     | Description                                                                  |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `CIRCLE_API_KEY`             | Circle API secret key                                                        |
| `CIRCLE_BASE_URL`            | Circle API base URL ([https://api.circle.com/v1](https://api.circle.com/v1)) |
| `ARC_RPC_URL`                | Arc testnet RPC                                                              |
| `USDC_ADDRESS`               | USDC token address on Arc                                                    |
| `REGISTRY_ADDRESS`           | Deployed VoiceAgentRegistry address                                          |
| `ESCROW_ADDRESS`             | Deployed VoiceJobEscrow address                                              |
| `RELAYER_PRIVATE_KEY`        | Private key of backend wallet calling `markCompleted()`                      |
| `ELEVENLABS_WEBHOOK_SECRET`  | Webhook verification secret from ElevenLabs                                  |

---

---

## 12. Key Success Metrics

- ✅ Seamless AI–blockchain integration (ElevenLabs → Arc)
- ✅ Real-world payments powered by USDC
- ✅ Fully automated escrow + payout flow
- ✅ Transparent, on-chain job history
- ✅ Circle ecosystem usage (Wallets, Transfers, USDC)

---

## 13. Deliverables

1. **Next.js full-stack app** with frontend, API routes, and webhook handling
2. **Two Solidity smart contracts** (`VoiceAgentRegistry`, `VoiceJobEscrow`) deployed on Arc testnet
3. **Circle + ElevenLabs integrations** (wallets, calls, webhooks)
4. **Demo dashboard** (hire → call → payment released → explorer link)

\# FairLend User Guide



\## Table of Contents



1\. \[What is FairLend?](#what-is-fairlend)

2\. \[Getting Started](#getting-started)

3\. \[Understanding Your FairScore](#understanding-your-fairscore)

4\. \[How to Borrow](#how-to-borrow)

5\. \[How to Lend](#how-to-lend)

6\. \[How to Vouch](#how-to-vouch)

7\. \[FAQ](#faq)



---



\## What is FairLend?



FairLend is a \*\*reputation-based lending protocol\*\*. Instead of requiring massive collateral like traditional DeFi (150%+), FairLend uses your on-chain history to determine your loan terms.



\*\*Better reputation = Better terms:\*\*

\- Lower collateral requirements

\- Higher borrowing limits

\- Lower interest rates



---



\## Getting Started



\### What You Need



| Requirement | Description |

|-------------|-------------|

| MetaMask | Browser wallet for Base network |

| Solana Wallet | Phantom or similar (this is what gets scored) |

| Base ETH | Small amount for gas fees (~$1) |



\### Step 1: Visit the App



Go to: \*\*https://fairlend-eight.vercel.app\*\*



\### Step 2: Connect Your Wallet



1\. Click \*\*"Launch App"\*\*

2\. Click \*\*"Connect Wallet"\*\*

3\. Select \*\*MetaMask\*\*

4\. Approve the connection



\### Step 3: View Your Dashboard



After connecting, you'll see:

\- Your \*\*FairScore\*\* (0-100)

\- Your \*\*Tier\*\* (Bronze, Silver, Gold, Platinum)

\- Your \*\*Credit Terms\*\* (max loan, collateral %, interest rate)

\- Any \*\*Badges\*\* you've earned



---



\## Understanding Your FairScore



\### What is FairScore?



FairScore is your on-chain reputation score calculated by \*\*FairScale\*\*. It analyzes your \*\*Solana wallet\*\* activity.



\### Score Breakdown



| Component | Description |

|-----------|-------------|

| Wallet Score | Based on on-chain activity |

| Social Score | Based on social reputation |

| Combined | Final FairScore (weighted average) |



\### Tier System



| Tier | Score | What You Get |

|------|-------|--------------|

| 🟣 Platinum | 80+ | 100% collateral, $50k max, 8% APY |

| 🟡 Gold | 60-79 | 120% collateral, $25k max, 10% APY |

| ⚪ Silver | 40-59 | 135% collateral, $10k max, 12% APY |

| 🟠 Bronze | 20-39 | 150% collateral, $5k max, 14% APY |



\### Badges



Badges show special achievements:

\- \*\*Diamond Hands\*\* — Long-term holder

\- \*\*LST Staker\*\* — Stakes liquid staking tokens

\- \*\*No Instant Dumps\*\* — Doesn't sell immediately after buying

\- \*\*DeFi Native\*\* — Active in DeFi protocols



\### How to Improve Your Score



✅ \*\*Do:\*\*

\- Hold tokens long-term

\- Use multiple DeFi platforms

\- Maintain consistent activity

\- Stake in legitimate protocols

\- Repay FairLend loans on time



❌ \*\*Don't:\*\*

\- Dump tokens immediately after buying

\- Have an inactive wallet

\- Default on loans



---



\## How to Borrow



\### Step 1: Check Your Terms



On the dashboard, see your:

\- \*\*Max Loan\*\* — Maximum you can borrow

\- \*\*Collateral Required\*\* — Percentage you must deposit

\- \*\*Interest Rate\*\* — Your APY



\### Step 2: Go to Borrow Page



Click the \*\*"Borrow"\*\* card on your dashboard.



\### Step 3: Enter Loan Details



1\. \*\*Amount\*\* — How much to borrow (USDC)

2\. \*\*Duration\*\* — Loan length (7-90 days)



\### Step 4: Review Summary



Check:

\- Collateral required (in ETH)

\- Interest you'll pay

\- Total repayment amount



\### Step 5: Submit Transaction



1\. Click \*\*"Request Loan"\*\*

2\. Approve collateral transfer in MetaMask

3\. Confirm the borrow transaction

4\. Receive USDC in your wallet!



\### Step 6: Repay



Before the loan expires:

1\. Go to Dashboard

2\. Click on your active loan

3\. Click \*\*"Repay"\*\*

4\. Approve the transaction

5\. Get your collateral back!



---



\## How to Lend



Earn yield by providing liquidity.



\### Two Pool Types



| Pool | Risk | Yield | Description |

|------|------|-------|-------------|

| Senior | Lower | Lower | Protected from losses |

| Junior | Higher | Higher | First to absorb losses, but higher APY |



\### Steps to Lend



1\. Click \*\*"Lend"\*\* on dashboard

2\. Choose \*\*Senior\*\* or \*\*Junior\*\* pool

3\. Enter amount (USDC)

4\. Click \*\*"Deposit"\*\*

5\. Approve transaction in MetaMask



\### Withdrawing



1\. Go to Lend page

2\. Click \*\*"Withdraw"\*\*

3\. Enter amount

4\. Confirm transaction



---



\## How to Vouch



Vouch for borrowers to help them get better terms and earn rewards.



\### Requirements



\- FairScore of \*\*40+\*\* to vouch

\- USDC to stake



\### How It Works



1\. You stake USDC to vouch for a borrower

2\. If they \*\*repay\*\* → You earn rewards (10% of interest)

3\. If they \*\*default\*\* → Your stake gets slashed



\### Steps to Vouch



1\. Click \*\*"Vouch"\*\* on dashboard

2\. Enter borrower's address

3\. Enter stake amount

4\. Click \*\*"Vouch"\*\*

5\. Approve transaction



\### Risks



⚠️ If the borrower defaults, you lose your stake!



Only vouch for people you trust.



---



\## FAQ



\### General



\*\*Q: Is FairLend safe?\*\*

A: FairLend uses audited smart contracts and a 4-layer risk system. However, all DeFi carries risk. Never deposit more than you can afford to lose.



\*\*Q: Why do I need a Solana wallet?\*\*

A: FairScale (which provides the reputation scores) analyzes Solana wallet activity. Your EVM wallet is used for the actual lending on Base.



\*\*Q: What if I don't have a Solana wallet?\*\*

A: You can still use FairLend, but you'll get a low/default FairScore, meaning higher collateral requirements.



\### Borrowing



\*\*Q: What happens if I don't repay on time?\*\*

A: Your loan becomes liquidatable. Anyone can trigger liquidation, your collateral is seized, and your FairScore drops significantly.



\*\*Q: Can I repay early?\*\*

A: Yes! You only pay interest for the time you held the loan.



\*\*Q: What collateral is accepted?\*\*

A: Currently ETH (WETH) on Base network.



\### Scores



\*\*Q: Why is my score low?\*\*

A: Common reasons:

\- New wallet with little history

\- Inactive wallet

\- Previous defaults

\- No DeFi activity



\*\*Q: How long to improve my score?\*\*

A: Scores update based on on-chain activity. Regular positive activity over weeks/months will improve it.



\*\*Q: My score seems wrong?\*\*

A: Make sure you're checking the right Solana wallet. Contact FairScale support for score disputes.



\### Technical



\*\*Q: Which network is FairLend on?\*\*

A: Base (Ethereum L2).



\*\*Q: What tokens can I borrow?\*\*

A: Currently USDC only.



\*\*Q: Are there fees?\*\*

A: 

\- Origination fee: 0.5%

\- Interest: Based on your tier (8-16% APY)

\- Gas fees: Standard Base network fees



---



\## Support



\- \*\*Twitter:\*\* \[@FairLendXYZ](https://twitter.com/FairLendXYZ)

\- \*\*FairScale Telegram:\*\* \[Join](https://t.me/+XF23ay9aY1AzYzlk)

\- \*\*GitHub Issues:\*\* \[Report bugs](https://github.com/Fourthe3rd/fairlend/issues)



---



\## Disclaimer



FairLend is experimental software. Use at your own risk. This is not financial advice. Always do your own research before participating in DeFi protocols.


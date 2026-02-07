\# FairLend API Documentation



\## Base URL



| Environment | URL |

|-------------|-----|

| Production | `https://fairlend-production.up.railway.app` |

| Local | `http://localhost:3001` |



\## Authentication



No authentication required for read endpoints. Write endpoints require signed transactions.



---



\## Endpoints



\### Health Check



Check if the API is running.



\*\*Request:\*\*

```

GET /health

```



\*\*Response:\*\*

```json

{

&nbsp; "status": "ok",

&nbsp; "timestamp": "2024-01-15T10:30:00Z",

&nbsp; "chainId": 8453,

&nbsp; "contract": "0x8A082F5ef985671C2DA430fC71b6Cee1e9Bf2D34",

&nbsp; "fairscaleApi": "https://api2.fairscale.xyz"

}

```



---



\### Get FairScore



Get FairScore and credit terms for a wallet.



\*\*Request:\*\*

```

GET /api/score/:wallet

```



\*\*Parameters:\*\*

| Name | Type | Description |

|------|------|-------------|

| wallet | string | Solana wallet address |



\*\*Example:\*\*

```

GET /api/score/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

```



\*\*Response:\*\*

```json

{

&nbsp; "wallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",

&nbsp; "fairScore": 65.3,

&nbsp; "fairScoreBase": 58.1,

&nbsp; "socialScore": 36,

&nbsp; "tier": "gold",

&nbsp; "timestamp": "2024-01-15T10:30:00Z",

&nbsp; "badges": \[

&nbsp;   {

&nbsp;     "id": "diamond\_hands",

&nbsp;     "label": "Diamond Hands",

&nbsp;     "description": "Long-term holder with conviction",

&nbsp;     "tier": "platinum"

&nbsp;   }

&nbsp; ],

&nbsp; "features": {

&nbsp;   "wallet\_age\_days": 365,

&nbsp;   "tx\_count": 150,

&nbsp;   "platform\_diversity": 8

&nbsp; },

&nbsp; "creditTerms": {

&nbsp;   "maxLoan": "25000",

&nbsp;   "collateralRatio": 120,

&nbsp;   "interestRate": 10

&nbsp; }

}

```



---



\### Get Attestation



Get signed attestation for updating credit limit on-chain.



\*\*Request:\*\*

```

GET /api/attestation/:wallet

```



\*\*Parameters:\*\*

| Name | Type | Description |

|------|------|-------------|

| wallet | string | EVM wallet address |



\*\*Example:\*\*

```

GET /api/attestation/0x742d35Cc6634C0532925a3b844Bc9e7595f8bC21

```



\*\*Response:\*\*

```json

{

&nbsp; "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f8bC21",

&nbsp; "fairScore": 65.3,

&nbsp; "tier": "gold",

&nbsp; "terms": {

&nbsp;   "maxLoan": "25000000000",

&nbsp;   "collateralRatio": 12000,

&nbsp;   "interestRate": 1000,

&nbsp;   "expiry": 1705487200

&nbsp; },

&nbsp; "signature": "0x1234...abcd",

&nbsp; "chainId": 8453,

&nbsp; "contract": "0x8A082F5ef985671C2DA430fC71b6Cee1e9Bf2D34"

}

```



\*\*Errors:\*\*

| Code | Message | Description |

|------|---------|-------------|

| 400 | FairScore too low | Score below minimum (20) |

| 500 | Contract address not configured | Missing config |



---



\### Report Loan Outcome



Report loan repayment or default (for future FairScale integration).



\*\*Request:\*\*

```

POST /api/report

```



\*\*Body:\*\*

```json

{

&nbsp; "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f8bC21",

&nbsp; "outcome": "repaid",

&nbsp; "loanId": "1",

&nbsp; "amount": 5000

}

```



\*\*Parameters:\*\*

| Name | Type | Description |

|------|------|-------------|

| wallet | string | Borrower's wallet address |

| outcome | string | `repaid` or `defaulted` |

| loanId | string | Loan ID from contract |

| amount | number | Loan amount in USD |



\*\*Response:\*\*

```json

{

&nbsp; "success": true,

&nbsp; "message": "Loan repaid recorded",

&nbsp; "wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f8bC21",

&nbsp; "loanId": "1",

&nbsp; "outcome": "repaid"

}

```



---



\### Get Protocol Stats



Get protocol statistics.



\*\*Request:\*\*

```

GET /api/stats

```



\*\*Response:\*\*

```json

{

&nbsp; "tvl": "50000",

&nbsp; "totalLoans": 25,

&nbsp; "activeLoans": 5,

&nbsp; "defaultRate": "2%",

&nbsp; "averageFairScore": 55

}

```



---



\### Test FairScale Connection



Test the FairScale API connection.



\*\*Request:\*\*

```

GET /api/test-fairscale

```



\*\*Response:\*\*

```json

{

&nbsp; "success": true,

&nbsp; "testWallet": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",

&nbsp; "result": {

&nbsp;   "fairscore": 65.3,

&nbsp;   "tier": "gold"

&nbsp; }

}

```



---



\## Error Handling



All errors return JSON with this format:

```json

{

&nbsp; "error": "Error message here"

}

```



\*\*Common HTTP Status Codes:\*\*

| Code | Description |

|------|-------------|

| 200 | Success |

| 400 | Bad request (invalid input) |

| 500 | Server error |



---



\## Rate Limits



| Endpoint | Limit |

|----------|-------|

| /api/score | 100 requests/minute |

| /api/attestation | 10 requests/minute per wallet |



---



\## Example Usage



\### JavaScript/Node.js

```javascript

const response = await fetch('https://fairlend-production.up.railway.app/api/score/YOUR\_WALLET');

const data = await response.json();

console.log(`Your FairScore: ${data.fairScore}`);

console.log(`Max Loan: $${data.creditTerms.maxLoan}`);

```



\### cURL

```bash

curl https://fairlend-production.up.railway.app/api/score/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU

```


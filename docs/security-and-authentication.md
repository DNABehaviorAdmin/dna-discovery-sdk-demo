# SDK Security & Authentication Best Practices

This guide explains how to properly handle API credentials when integrating the DNA Behavior Discovery SDK into a production web or mobile application.

---

## 🚨 Critical Rule: Never Expose Secrets on the Client

**NEVER** hardcode your `Subscription Key` (API Key) or `Encryption Key` (RSA Public Key) in any client-side JavaScript, HTML, or frontend application repositories. 

If these keys are exposed in a public repository or compiled client-side bundle, malicious users could extract them and launch assessments or access API endpoints on your behalf. 

The demo available in this repository explicitly asks users to enter their keys manually into the browser or `.env` specifically for **local testing purposes only**.

---

## The Secure Integration Flow

To securely authenticate the Discovery SDK iframe, you must use a Backend-to-Frontend handoff approach.

### 1. Store Credentials in a Secure Vault
Store your keys in a secure server-side location, such as:
- AWS Secrets Manager
- Azure Key Vault
- Google Cloud Secret Manager
- Server-side Environment Variables (e.g., `.env` on a Node.js server)

### 2. Server-Side Encryption (Backend)
When a user on your platform navigates to the assessment page, your secure backend must take the `Subscription Key` and encrypt it using the `Encryption Key` (RSA Public Key).

**Example (Node.js / crypto):**
```javascript
const crypto = require('crypto');

function getEncryptedKey() {
  const subscriptionKey = process.env.DNA_SUBSCRIPTION_KEY;
  const publicKey = process.env.DNA_ENCRYPTION_KEY;

  const encrypted = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    Buffer.from(subscriptionKey)
  );
  
  return encrypted.toString('base64');
}
```

### 3. Pass Encrypted Token to the Client (Frontend)
Your backend endpoint should serve this encrypted string (and user details like `firstname`, `lastname`, and `email`) to your frontend application. **Do not** send the raw subscription key.

### 4. Post Message to the iframe (Client-Side)
Your frontend application safely receives the encrypted string. Once the DNA Behavior SDK iframe finishes loading, use `window.postMessage` to pass the encrypted key directly to the iframe.

**Example (Vanilla JS):**
```javascript
const iframe = document.getElementById('discovery-frame');
const SDK_URL = 'https://embeddiscovery.dnabehavior.com/';

// The encrypted token you fetched securely from your backend API
const encryptedTokenFromBackend = "abc123encryptedString..."; 

iframe.addEventListener('load', () => {
  // Pass the token to authenticate the session
  iframe.contentWindow.postMessage(encryptedTokenFromBackend, SDK_URL);
});
```

---

## Where to Find Your Configuration Details

| Credential | Location |
|---|---|
| **Account ID** | DNA Web App → Settings Page |
| **Self-Registration ID** | Your self-registration URL (`.../investor/Demo/{accountId}/{selfRegistrationId}`) |
| **Encryption Key** | **Requires Support Ticket:** Submit a request to DNA Behavior for your RSA Public Key. |
| **Subscription Key** | DNA Developer Portal → API Keys |

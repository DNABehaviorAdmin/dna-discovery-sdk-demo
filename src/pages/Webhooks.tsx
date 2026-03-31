import { useState } from 'react';
import { CheckCircle2, Copy, Check, Webhook, ArrowRight, Database, Bell, RefreshCw } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import type { WebhookPayload } from '../types/sdk';

const samplePayload: WebhookPayload = {
  PersonID: 12345,
  CreditID: 67890,
  UserName: 'jane_smith',
  AccountID: 1234,
  AssignedNameUser: 'Jane Smith',
  Tag: [{ TagID: 1, TagName: 'VIP' }],
  FirstName: 'Jane',
  LastName: 'Smith',
  FullName: 'Jane Smith',
  DiscoveryType: 17,
  DiscoveryCompletionDate: '2025-06-15T10:30:00',
};

const registerSnippet = `// POST https://api.dnabehavior.com/prod-public-api/Accounts/RegisterWebhookURL
const response = await fetch(
  'https://api.dnabehavior.com/prod-public-api/Accounts/RegisterWebhookURL',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': process.env.DNA_SUBSCRIPTION_KEY,
    },
    body: JSON.stringify({
      accountId: 1234,
      webhookURL: 'https://yourdomain.com/api/webhooks/dna',
      status: true,
    }),
  }
);
// Response: { message: "Webhook registered successfully.", statusCode: 200 }`;

const expressHandlerSnippet = `// Express.js webhook handler
import express from 'express';
import type { WebhookPayload } from './types';

const router = express.Router();

router.post('/api/webhooks/dna', async (req, res) => {
  const payload: WebhookPayload = req.body;

  console.log('DNA profile completed:', {
    user: payload.FullName,
    email: payload.UserName,
    discoveryType: payload.DiscoveryType,
    completedAt: payload.DiscoveryCompletionDate,
  });

  // Sync to your CRM, trigger workflows, send notifications, etc.
  await syncToCRM(payload);
  await notifyAdvisor(payload.AssignedNameUser, payload);

  res.status(200).json({ received: true });
});

async function syncToCRM(payload: WebhookPayload) {
  // Add to Salesforce, HubSpot, Redtail, etc.
  await crm.contacts.upsert({
    email: payload.UserName,
    firstName: payload.FirstName,
    lastName: payload.LastName,
    customFields: {
      dnaBehaviorPersonId: payload.PersonID,
      behavioralProfileDate: payload.DiscoveryCompletionDate,
      assessmentType: \`\${payload.DiscoveryType} questions\`,
    },
  });
}`;

const nextjsHandlerSnippet = `// Next.js API route — pages/api/webhooks/dna.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') return res.status(405).end();

  const payload = req.body;

  // Validate the payload
  if (!payload.PersonID || !payload.AccountID) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // Process the completion
  await db.profileCompletions.create({
    data: {
      personId: payload.PersonID,
      accountId: payload.AccountID,
      fullName: payload.FullName,
      discoveryType: payload.DiscoveryType,
      completedAt: new Date(payload.DiscoveryCompletionDate),
    },
  });

  // Trigger any downstream workflows
  await triggerOnboarding(payload);

  return res.status(200).json({ success: true });
}`;

const flowSteps = [
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    title: 'User completes assessment',
    desc: 'The SDK marks the assessment complete and saves the behavioral profile.',
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: 'DNA API fires webhook',
    desc: 'A POST request is sent to your registered URL with the completion payload.',
  },
  {
    icon: <Database className="w-5 h-5" />,
    title: 'Your backend receives data',
    desc: 'Store the PersonID, sync to your CRM, trigger advisor alerts, or start a workflow.',
  },
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: 'Downstream automation',
    desc: 'Update client records, send welcome emails, unlock features — whatever your workflow needs.',
  },
];

function PayloadViewer({ payload }: { payload: WebhookPayload }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(payload, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-700 shadow-lg">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-primary-500/70" />
          </div>
          <span className="text-gray-400 text-xs ml-2">webhook-payload.json</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-primary-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            Live POST
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
          >
            {copied ? (
              <><Check className="w-3.5 h-3.5 text-primary-400" /><span className="text-primary-400">Copied!</span></>
            ) : (
              <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>
            )}
          </button>
        </div>
      </div>
      <div className="bg-gray-900 p-5 text-xs font-mono text-gray-300 overflow-auto max-h-96">
        <pre>{json}</pre>
      </div>
    </div>
  );
}

export default function Webhooks() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Webhook className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Webhook Integration</h1>
          </div>
          <p className="text-gray-500 text-lg max-w-2xl">
            Get notified the moment a user completes their behavioral assessment. Real-time data delivered to your endpoint — no polling required.
          </p>
        </div>

        {/* Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {flowSteps.map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-white rounded-2xl border border-gray-200 p-5 h-full">
                <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
                  {step.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
              {i < flowSteps.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-16">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">1</span>
              <h2 className="text-2xl font-bold text-gray-900">Register Your Webhook URL</h2>
            </div>
            <p className="text-gray-500 mb-6">
              Call the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-primary-700 text-sm">RegisterWebhookURL</code> API once to link your endpoint to your Account ID. You can do this from the DNA Developer Portal or directly via the API.
            </p>
            <CodeBlock code={registerSnippet} language="typescript" filename="scripts/register-webhook.ts" />
          </div>

          {/* Sample Payload */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">2</span>
              <h2 className="text-2xl font-bold text-gray-900">Receive the Completion Payload</h2>
            </div>
            <p className="text-gray-500 mb-6">
              When a user finishes their assessment, DNA Behavior sends this JSON payload to your endpoint. Here's what a real payload looks like:
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <PayloadViewer payload={samplePayload} />
              <div className="space-y-3">
                {[
                  { key: 'PersonID', desc: 'Unique DNA Behavior person identifier' },
                  { key: 'CreditID', desc: 'Assessment credit used for this completion' },
                  { key: 'UserName', desc: 'The email address of the user' },
                  { key: 'AccountID', desc: 'Your organization\'s account ID' },
                  { key: 'AssignedNameUser', desc: 'Name of the advisor assigned to this user' },
                  { key: 'Tag', desc: 'Tags associated with the user (e.g. VIP, prospect)' },
                  { key: 'DiscoveryType', desc: 'Question pattern used: 11, 17, or 46' },
                  { key: 'DiscoveryCompletionDate', desc: 'ISO 8601 timestamp of completion' },
                ].map(({ key, desc }) => (
                  <div key={key} className="flex items-start gap-3">
                    <code className="bg-primary-100 text-primary-700 px-2 py-0.5 rounded text-xs font-mono shrink-0 mt-0.5">{key}</code>
                    <span className="text-sm text-gray-600">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Handler examples */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shrink-0">3</span>
              <h2 className="text-2xl font-bold text-gray-900">Handle the Webhook</h2>
            </div>
            <p className="text-gray-500 mb-6">
              Your endpoint receives a standard HTTP POST. Here are handlers for the two most common Node.js server environments:
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Express.js</p>
                <CodeBlock code={expressHandlerSnippet} language="typescript" filename="routes/webhooks.ts" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Next.js App Router</p>
                <CodeBlock code={nextjsHandlerSnippet} language="typescript" filename="pages/api/webhooks/dna.ts" />
              </div>
            </div>
          </div>

          {/* Verify / Retrieve */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Verify or Update Your Webhook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-800 mb-2">Retrieve your current webhook URL</p>
                <code className="block bg-gray-100 rounded-lg p-3 font-mono text-xs break-all">
                  GET https://api.dnabehavior.com/prod-public-api/Accounts/GetWebhookURLByAccountId/&#123;AccountId&#125;
                </code>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-2">Update / overwrite webhook URL</p>
                <p className="text-gray-500">
                  Simply re-call the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-primary-700">RegisterWebhookURL</code> API with the new URL. The existing registration is overwritten.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  User,
  Settings,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
} from 'lucide-react';
import type { SDKConfig } from '../types/sdk';
import CodeBlock from '../components/CodeBlock';

const defaultConfig: SDKConfig = {
  accountId: '',
  selfRegistrationId: '',
  encryptionKey: '',
  subscriptionKey: '',
  questionPattern: '17',
  firstname: '',
  lastname: '',
  email: '',
};

const STORAGE_KEY = 'dna_sdk_config';

function loadConfig(): SDKConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultConfig, ...JSON.parse(stored) };
  } catch {}
  return defaultConfig;
}



export default function Setup() {
  const [config, setConfig] = useState<SDKConfig>(loadConfig);
  const [showEncryptionKey, setShowEncryptionKey] = useState(false);
  const [showSubscriptionKey, setShowSubscriptionKey] = useState(false);
  const navigate = useNavigate();

  const update = (field: keyof SDKConfig, value: string) =>
    setConfig((prev) => ({ ...prev, [field]: value }));

  const handleSaveAndDemo = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    navigate('/demo');
  };

  const isComplete =
    config.accountId &&
    config.selfRegistrationId &&
    config.encryptionKey &&
    config.subscriptionKey &&
    config.firstname &&
    config.lastname &&
    config.email;

  const fieldClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-shadow bg-white';

  const dynamicEnvSnippet = `# .env (NEVER commit this file)
DNA_ACCOUNT_ID=${config.accountId || 'your_account_id'}
DNA_SELF_REGISTRATION_ID=${config.selfRegistrationId || 'your_self_reg_id'}
DNA_ENCRYPTION_KEY="${config.encryptionKey || 'your_public_key_from_dna'}"
DNA_SUBSCRIPTION_KEY=${config.subscriptionKey || 'your_subscription_key'}`;

  const dynamicEncryptionSnippet = `import JSEncrypt from 'jsencrypt';

// Your public encryption key from DNA Behavior
const publicKey = process.env.DNA_ENCRYPTION_KEY;

export function encryptSubscriptionKey(subscriptionKey: string): string {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  const encrypted = encryptor.encrypt(subscriptionKey);
  if (!encrypted) throw new Error('Encryption failed');
  return encrypted;
}

// Example URL Construction:
// const url = \`https://embeddiscovery.dnabehavior.com/?accountId=\${process.env.DNA_ACCOUNT_ID}&selfRegistrationId=\${process.env.DNA_SELF_REGISTRATION_ID}&questionPattern=${config.questionPattern}&firstname=${config.firstname || 'Jane'}&lastname=${config.lastname || 'Doe'}&email=${config.email || 'jane@example.com'}\`;`;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">SDK Setup Guide</h1>
          <p className="text-gray-500 text-lg">
            Configure your credentials below. <strong>Scroll down to the bottom of the page</strong> as you type to see the implementation code blocks automatically update with your live data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">

            {/* Security notice */}
            <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <div>
                <strong>Demo only:</strong> This page stores credentials in browser localStorage for demonstration purposes.
                In production, credentials should be stored in a secure key vault (AWS Secrets Manager, Azure Key Vault, etc.) and never exposed client-side.
              </div>
            </div>

            {/* Credentials Section */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Account Credentials</h2>
                  <p className="text-xs text-gray-400">From your DNA Behavior account & Developer Portal</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Account ID
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 12345"
                    className={fieldClass}
                    value={config.accountId}
                    onChange={(e) => update('accountId', e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">Found in your DNA Web App settings page.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Self-Registration ID
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. abc-def-123"
                    className={fieldClass}
                    value={config.selfRegistrationId}
                    onChange={(e) => update('selfRegistrationId', e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    From your self-registration URL:{' '}
                    <code className="text-primary-600 bg-primary-50 px-1 rounded text-xs">
                      discovery.dnabehavior.com/investor/Demo/&#123;accountId&#125;/&#123;selfRegistrationId&#125;
                    </code>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Encryption Key (Public Key)
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      style={{ WebkitTextSecurity: showEncryptionKey ? 'none' : 'disc' } as any}
                      placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkqhkiG9w0B...&#10;-----END PUBLIC KEY-----"
                      className={`${fieldClass} font-mono text-xs resize-none pr-10`}
                      value={config.encryptionKey}
                      onChange={(e) => update('encryptionKey', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEncryptionKey(!showEncryptionKey)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showEncryptionKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">RSA public key provided by DNA Behavior via support ticket.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Subscription Key (DNA API Key)
                    <span className="ml-1 text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSubscriptionKey ? 'text' : 'password'}
                      placeholder="Your subscription key"
                      className={`${fieldClass} pr-10`}
                      value={config.subscriptionKey}
                      onChange={(e) => update('subscriptionKey', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSubscriptionKey(!showSubscriptionKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSubscriptionKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Available in the DNA Developer Portal.</p>
                </div>
              </div>
            </div>

            {/* Question Pattern */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Assessment Configuration</h2>
                  <p className="text-xs text-gray-400">Choose question depth and user information</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Pattern <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['11', '17', '46'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => update('questionPattern', p)}
                        className={`py-3 rounded-xl border-2 text-center transition-all ${
                          config.questionPattern === p
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xl font-bold">{p}</div>
                        <div className="text-xs mt-0.5">questions</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">User Information</h2>
                  <p className="text-xs text-gray-400">In production these come from your authenticated session</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Jane"
                      className={fieldClass}
                      value={config.firstname}
                      onChange={(e) => update('firstname', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Smith"
                      className={fieldClass}
                      value={config.lastname}
                      onChange={(e) => update('lastname', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="jane@example.com"
                    className={fieldClass}
                    value={config.email}
                    onChange={(e) => update('email', e.target.value)}
                  />
                  <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Each email is a unique record. Use a different email if the user needs to take a higher question-count assessment.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveAndDemo}
                disabled={!isComplete}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Save & Launch Demo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress checklist */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">Configuration Checklist</h3>
              <ul className="space-y-2.5">
                {[
                  { label: 'Account ID', done: !!config.accountId },
                  { label: 'Self-Registration ID', done: !!config.selfRegistrationId },
                  { label: 'Encryption Key', done: !!config.encryptionKey },
                  { label: 'Subscription Key', done: !!config.subscriptionKey },
                  { label: 'Question Pattern', done: !!config.questionPattern },
                  { label: 'First Name', done: !!config.firstname },
                  { label: 'Last Name', done: !!config.lastname },
                  { label: 'Email', done: !!config.email },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2.5 text-sm">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.done ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-300'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className={item.done ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                  </li>
                ))}
              </ul>
              {isComplete && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg text-xs text-primary-700 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Ready to launch demo!
                </div>
              )}
            </div>

            {/* Help link */}
            <div className="bg-primary-50 rounded-2xl border border-primary-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">Where to find your keys</h3>
              <ul className="text-xs text-gray-600 space-y-2">
                <li><strong>Account ID:</strong> DNA Web App → Settings</li>
                <li><strong>Self-Reg ID:</strong> DNA Web App → Self-Registration link</li>
                <li><strong>Encryption Key:</strong> Submit a support ticket to DNA Behavior</li>
                <li><strong>Subscription Key:</strong> DNA Developer Portal → API Keys</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Encryption code example */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Encrypting Your Subscription Key</h2>
          <p className="text-gray-500 mb-6">
            The subscription key must be RSA-encrypted with the public key DNA Behavior provides before it is passed to the iframe. Here's how to do it with the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-primary-700 text-sm">jsencrypt</code> package:
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Encryption utility</p>
              <CodeBlock code={dynamicEncryptionSnippet} language="typescript" filename="utils/encryption.ts" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Environment variables (never commit!)</p>
              <CodeBlock code={dynamicEnvSnippet} language="bash" filename=".env" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

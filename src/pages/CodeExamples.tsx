import { useState } from 'react';
import CodeBlock from '../components/CodeBlock';
import { CheckCircle2 } from 'lucide-react';

const tabs = [
  { id: 'react', label: 'React' },
  { id: 'angular', label: 'Angular' },
  { id: 'vue', label: 'Vue 3' },
  { id: 'vanilla', label: 'Vanilla JS' },
];

const snippets: Record<string, { title: string; description: string; code: string; language: string; filename: string }[]> = {
  react: [
    {
      title: '1. Encryption Utility',
      description: 'Encrypt the subscription key with the RSA public key using jsencrypt.',
      language: 'typescript',
      filename: 'src/utils/encryption.ts',
      code: `import JSEncrypt from 'jsencrypt';

export function encryptSubscriptionKey(
  subscriptionKey: string,
  publicKey: string
): string {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(publicKey);
  const encrypted = encryptor.encrypt(subscriptionKey);
  if (!encrypted) throw new Error('Failed to encrypt subscription key');
  return encrypted;
}`,
    },
    {
      title: '2. SDK iframe Component',
      description: 'A reusable React component that embeds the Discovery SDK, posts the encrypted key on load, and listens for the completion event.',
      language: 'tsx',
      filename: 'src/components/DiscoverySDK.tsx',
      code: `import { useEffect, useRef, useCallback } from 'react';
import { encryptSubscriptionKey } from '../utils/encryption';

const SDK_BASE_URL = 'https://embeddiscovery.dnabehavior.com/';

interface DiscoverySDKProps {
  accountId: string;
  selfRegistrationId: string;
  questionPattern: '11' | '17' | '46';
  firstname: string;
  lastname: string;
  email: string;
  subscriptionKey: string;   // from your secure backend
  encryptionKey: string;     // from your secure backend
  onComplete?: () => void;
}

export function DiscoverySDK({
  accountId,
  selfRegistrationId,
  questionPattern,
  firstname,
  lastname,
  email,
  subscriptionKey,
  encryptionKey,
  onComplete,
}: DiscoverySDKProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const src = new URL(SDK_BASE_URL);
  src.searchParams.set('accountId', accountId);
  src.searchParams.set('selfRegistrationId', selfRegistrationId);
  src.searchParams.set('questionPattern', questionPattern);
  src.searchParams.set('firstname', firstname);
  src.searchParams.set('lastname', lastname);
  src.searchParams.set('email', email);

  // Post encrypted key once the iframe loads
  const handleLoad = useCallback(() => {
    const encryptedKey = encryptSubscriptionKey(subscriptionKey, encryptionKey);
    iframeRef.current?.contentWindow?.postMessage(encryptedKey, SDK_BASE_URL);
  }, [subscriptionKey, encryptionKey]);

  // Listen for screenChanged events from the SDK
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== SDK_BASE_URL.replace(/\\/$/, '')) return;
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'screenChanged' && data.value === 'dashboard') {
          onComplete?.();
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onComplete]);

  return (
    <iframe
      ref={iframeRef}
      src={src.toString()}
      onLoad={handleLoad}
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="DNA Behavior Discovery"
    />
  );
}`,
    },
    {
      title: '3. Discovery Page',
      description: 'Full-screen route that shows the SDK, then swaps to your own results UI when the assessment is done.',
      language: 'tsx',
      filename: 'src/pages/DiscoveryPage.tsx',
      code: `import { useState } from 'react';
import { DiscoverySDK } from '../components/DiscoverySDK';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useSDKCredentials } from '../hooks/useSDKCredentials';

export default function DiscoveryPage() {
  const [completed, setCompleted] = useState(false);
  const user = useCurrentUser();            // from your auth system
  const creds = useSDKCredentials();        // from your backend / key vault

  if (completed) {
    return <ResultsDashboard user={user} />;
  }

  return (
    <DiscoverySDK
      accountId={creds.accountId}
      selfRegistrationId={creds.selfRegistrationId}
      questionPattern="17"
      firstname={user.firstname}
      lastname={user.lastname}
      email={user.email}
      subscriptionKey={creds.subscriptionKey}
      encryptionKey={creds.encryptionKey}
      onComplete={() => setCompleted(true)}
    />
  );
}`,
    },
  ],
  angular: [
    {
      title: '1. Encryption Service',
      description: 'Angular service for encrypting the subscription key.',
      language: 'typescript',
      filename: 'src/app/services/encryption.service.ts',
      code: `import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as JSEncrypt from 'jsencrypt';

@Injectable({ providedIn: 'root' })
export class EncryptionService {
  encrypt(value: string): string {
    const encryptor = new JSEncrypt.JSEncrypt();
    encryptor.setPublicKey(environment.encryptionKey);
    const result = encryptor.encrypt(value);
    if (!result) throw new Error('Encryption failed');
    return result;
  }
}`,
    },
    {
      title: '2. Discovery Component',
      description: 'Angular component embedding the Discovery SDK iframe.',
      language: 'typescript',
      filename: 'src/app/discovery/discovery.component.ts',
      code: `import {
  Component, OnInit, OnDestroy,
  ElementRef, ViewChild, Output, EventEmitter, Input
} from '@angular/core';
import { EncryptionService } from '../services/encryption.service';
import { environment } from '../../environments/environment';

const SDK_URL = 'https://embeddiscovery.dnabehavior.com/';

@Component({
  selector: 'app-discovery',
  template: \`
    <iframe
      #sdkFrame
      [src]="iframeSrc | safe"
      (load)="onLoad()"
      width="100%"
      height="100%"
      frameborder="0">
    </iframe>
  \`,
  styles: [':host { display: block; width: 100%; height: 100vh; }']
})
export class DiscoveryComponent implements OnInit, OnDestroy {
  @ViewChild('sdkFrame') iframe!: ElementRef<HTMLIFrameElement>;
  @Input() firstname!: string;
  @Input() lastname!: string;
  @Input() email!: string;
  @Output() completed = new EventEmitter<void>();

  iframeSrc = '';

  constructor(private encryption: EncryptionService) {}

  ngOnInit() {
    const params = new URLSearchParams({
      accountId: environment.accountId,
      selfRegistrationId: environment.selfRegistrationId,
      questionPattern: '17',
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
    });
    this.iframeSrc = \`\${SDK_URL}?\${params}\`;
    window.addEventListener('message', this.onMessage);
  }

  onLoad() {
    const encryptedKey = this.encryption.encrypt(environment.subscriptionKey);
    this.iframe.nativeElement.contentWindow?.postMessage(encryptedKey, SDK_URL);
  }

  onMessage = (e: MessageEvent) => {
    if (e.origin !== SDK_URL.replace(/\\/$/, '')) return;
    try {
      const data = JSON.parse(e.data);
      if (data?.type === 'screenChanged' && data.value === 'dashboard') {
        this.completed.emit();
      }
    } catch {}
  };

  ngOnDestroy() {
    window.removeEventListener('message', this.onMessage);
  }
}`,
    },
  ],
  vue: [
    {
      title: 'Discovery SDK Component',
      description: 'Vue 3 Composition API component with the full SDK integration.',
      language: 'html',
      filename: 'src/components/DiscoverySDK.vue',
      code: `<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import JSEncrypt from 'jsencrypt';

const SDK_BASE_URL = 'https://embeddiscovery.dnabehavior.com/';

const props = defineProps<{
  accountId: string;
  selfRegistrationId: string;
  questionPattern: '11' | '17' | '46';
  firstname: string;
  lastname: string;
  email: string;
  subscriptionKey: string;
  encryptionKey: string;
}>();

const emit = defineEmits<{ (e: 'complete'): void }>();

const iframeRef = ref<HTMLIFrameElement | null>(null);

const iframeSrc = computed(() => {
  const url = new URL(SDK_BASE_URL);
  url.searchParams.set('accountId', props.accountId);
  url.searchParams.set('selfRegistrationId', props.selfRegistrationId);
  url.searchParams.set('questionPattern', props.questionPattern);
  url.searchParams.set('firstname', props.firstname);
  url.searchParams.set('lastname', props.lastname);
  url.searchParams.set('email', props.email);
  return url.toString();
});

function onLoad() {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(props.encryptionKey);
  const encryptedKey = encryptor.encrypt(props.subscriptionKey);
  if (encryptedKey) {
    iframeRef.value?.contentWindow?.postMessage(encryptedKey, SDK_BASE_URL);
  }
}

function handleMessage(event: MessageEvent) {
  if (event.origin !== SDK_BASE_URL.replace(/\\/$/, '')) return;
  try {
    const data = JSON.parse(event.data);
    if (data?.type === 'screenChanged' && data.value === 'dashboard') {
      emit('complete');
    }
  } catch {}
}

onMounted(() => window.addEventListener('message', handleMessage));
onUnmounted(() => window.removeEventListener('message', handleMessage));
</script>

<template>
  <iframe
    ref="iframeRef"
    :src="iframeSrc"
    @load="onLoad"
    style="width: 100%; height: 100vh; border: none;"
    title="DNA Behavior Discovery"
  />
</template>`,
    },
  ],
  vanilla: [
    {
      title: 'Vanilla JavaScript Integration',
      description: 'Pure HTML + JavaScript implementation — no framework required.',
      language: 'html',
      filename: 'discovery.html',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>DNA Behavior Discovery</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.3.2/jsencrypt.min.js"></scr` + `ipt>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, html { height: 100%; }
    #discovery-frame { width: 100%; height: 100vh; border: none; }
    #results { display: none; padding: 40px; text-align: center; }
  </style>
</head>
<body>
  <iframe id="discovery-frame" title="DNA Behavior Discovery"></iframe>
  <div id="results">
    <h1>Assessment Complete!</h1>
    <p>Your custom results UI goes here.</p>
  </div>

  <script>
    // !! In production, fetch these from your server — never hard-code them !!
    const config = {
      accountId: 'YOUR_ACCOUNT_ID',
      selfRegistrationId: 'YOUR_SELF_REG_ID',
      questionPattern: '17',
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane@example.com',
      subscriptionKey: 'YOUR_SUBSCRIPTION_KEY',
      encryptionKey: 'YOUR_PUBLIC_KEY',
    };

    const SDK_URL = 'https://embeddiscovery.dnabehavior.com/';

    // Build iframe src
    const params = new URLSearchParams({
      accountId: config.accountId,
      selfRegistrationId: config.selfRegistrationId,
      questionPattern: config.questionPattern,
      firstname: config.firstname,
      lastname: config.lastname,
      email: config.email,
    });

    const frame = document.getElementById('discovery-frame');
    frame.src = SDK_URL + '?' + params.toString();

    // Post encrypted key when iframe loads
    frame.addEventListener('load', () => {
      const encryptor = new JSEncrypt();
      encryptor.setKey(config.encryptionKey);
      const encryptedKey = encryptor.encrypt(config.subscriptionKey);
      if (encryptedKey) {
        frame.contentWindow.postMessage(encryptedKey, SDK_URL);
      }
    });

    // Listen for completion event
    window.addEventListener('message', (event) => {
      if (event.origin !== SDK_URL.replace(/\\/$/, '')) return;
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'screenChanged' && data.value === 'dashboard') {
          frame.style.display = 'none';
          document.getElementById('results').style.display = 'block';
        }
      } catch {}
    });
  </scr` + `ipt>
</body>
</html>`,
    },
  ],
};

export default function CodeExamples() {
  const [activeTab, setActiveTab] = useState('react');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Code Examples</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Copy-paste examples for integrating the Discovery SDK into your preferred framework.
          </p>
        </div>

        {/* Key points */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { text: 'Encrypt the subscription key before passing it to the iframe' },
            { text: 'Use postMessage after iframe load to authorize the session' },
            { text: 'Listen for screenChanged: dashboard to trigger your custom UI' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4">
              <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code snippets */}
        <div className="space-y-10">
          {(snippets[activeTab] || []).map((snippet, i) => (
            <div key={i}>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">{snippet.title}</h2>
                <p className="text-gray-500 text-sm mt-1">{snippet.description}</p>
              </div>
              <CodeBlock code={snippet.code} language={snippet.language} filename={snippet.filename} />
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-16 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
          <h3 className="font-semibold text-amber-900 mb-2">Security Reminder</h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            Never hard-code <code className="bg-amber-100 px-1 rounded">subscriptionKey</code>, <code className="bg-amber-100 px-1 rounded">encryptionKey</code>, or <code className="bg-amber-100 px-1 rounded">accountId</code> directly in client-side code.
            Always load them from a secure backend endpoint or key vault, and ensure your discovery page is behind your authentication layer.
          </p>
        </div>
      </div>
    </div>
  );
}

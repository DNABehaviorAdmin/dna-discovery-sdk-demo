import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import JSEncrypt from 'jsencrypt';
import type { SDKConfig } from '../types/sdk';

const STORAGE_KEY = 'dna_sdk_config';
const SDK_BASE_URL = 'https://embeddiscovery.dnabehavior.com/';

type DemoStatus = 'idle' | 'loading' | 'ready' | 'completed' | 'error';

function loadConfig(): SDKConfig | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const cfg = JSON.parse(stored) as SDKConfig;
      if (cfg.accountId && cfg.selfRegistrationId && cfg.encryptionKey && cfg.subscriptionKey && cfg.email) {
        return cfg;
      }
    }
  } catch {}
  return null;
}

function encryptKey(subscriptionKey: string, encryptionKey: string): string | false {
  const encryptor = new JSEncrypt();
  encryptor.setPublicKey(encryptionKey);
  return encryptor.encrypt(subscriptionKey);
}

function buildIframeSrc(config: SDKConfig): string {
  const params = new URLSearchParams({
    accountId: config.accountId,
    selfRegistrationId: config.selfRegistrationId,
    questionPattern: config.questionPattern,
    firstname: config.firstname,
    lastname: config.lastname,
    email: config.email,
  });
  return `${SDK_BASE_URL}?${params.toString()}`;
}

const eventLog: Array<{ time: string; event: string; detail?: string }> = [];

export default function Demo() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [config] = useState<SDKConfig | null>(loadConfig);
  const [status, setStatus] = useState<DemoStatus>('idle');
  const [events, setEvents] = useState(eventLog);
  const [showCustomUI, setShowCustomUI] = useState(false);

  const addEvent = (event: string, detail?: string) => {
    const entry = { time: new Date().toLocaleTimeString(), event, detail };
    eventLog.push(entry);
    setEvents([...eventLog]);
  };

  // Listen for postMessage events from the SDK iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== SDK_BASE_URL.replace(/\/$/, '')) return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.type === 'screenChanged') {
          addEvent('screenChanged', `value: "${data.value}"`);
          if (data.value === 'dashboard') {
            setShowCustomUI(true);
            setStatus('completed');
            addEvent('Assessment complete!', 'Displaying custom results UI');
          }
        }
      } catch {
        // not a structured message
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleIframeLoad = () => {
    if (!config || !iframeRef.current) return;
    setStatus('ready');
    addEvent('iframe loaded', 'Sending encrypted subscription key via postMessage');

    const encryptedKey = encryptKey(config.subscriptionKey, config.encryptionKey);
    if (!encryptedKey) {
      addEvent('Encryption failed', 'Check your encryption key format');
      setStatus('error');
      return;
    }

    iframeRef.current.contentWindow?.postMessage(encryptedKey, SDK_BASE_URL);
    addEvent('postMessage sent', 'Encrypted key delivered to SDK');
  };

  const handleLaunch = () => {
    setStatus('loading');
    setShowCustomUI(false);
    eventLog.length = 0;
    setEvents([]);
    addEvent('Launching SDK', `questionPattern: ${config?.questionPattern}`);
  };

  const handleReset = () => {
    setStatus('idle');
    setShowCustomUI(false);
    eventLog.length = 0;
    setEvents([]);
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Setup Required</h2>
          <p className="text-gray-500 mb-8">
            You need to configure your DNA Behavior SDK credentials before launching the demo.
          </p>
          <Link
            to="/setup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Go to Setup
          </Link>
        </div>
      </div>
    );
  }

  const iframeSrc = buildIframeSrc(config);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Demo toolbar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Status indicator */}
            <div className={`flex items-center gap-2 text-sm ${
              status === 'completed' ? 'text-primary-400' :
              status === 'error' ? 'text-red-400' :
              status === 'ready' ? 'text-secondary-400' :
              status === 'loading' ? 'text-yellow-400' :
              'text-gray-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                status === 'completed' ? 'bg-primary-400' :
                status === 'error' ? 'bg-red-400' :
                status === 'ready' || status === 'loading' ? 'bg-yellow-400 animate-pulse' :
                'bg-gray-500'
              }`} />
              {status === 'idle' && 'Ready to launch'}
              {status === 'loading' && 'Loading SDK...'}
              {status === 'ready' && 'SDK active'}
              {status === 'completed' && 'Assessment complete'}
              {status === 'error' && 'Error — check credentials'}
            </div>

            <div className="text-xs text-gray-500 hidden sm:block">
              User: <span className="text-gray-300">{config.firstname} {config.lastname}</span>
              <span className="mx-2">·</span>
              Pattern: <span className="text-gray-300">{config.questionPattern} questions</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/setup"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Edit Config
            </Link>
            {status !== 'idle' && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:border-gray-400 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left: iframe / launch screen */}
        <div className="flex-1 relative bg-gray-950 flex items-center justify-center">
          {status === 'idle' && (
            <div className="text-center px-8 py-16 max-w-lg">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-900/50">
                <ExternalLink className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Live SDK Demo</h2>
              <p className="text-gray-400 mb-2">
                Click Launch to embed the Discovery SDK iframe. The assessment will run right here in this page — just like it would inside your own application.
              </p>
              <div className="text-sm text-gray-500 mb-8 space-y-1">
                <p>Account: <span className="text-primary-400">{config.accountId}</span></p>
                <p>Pattern: <span className="text-primary-400">{config.questionPattern} questions</span></p>
                <p>User: <span className="text-primary-400">{config.firstname} {config.lastname} ({config.email})</span></p>
              </div>
              <button
                onClick={handleLaunch}
                className="px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary-900/50"
              >
                Launch Discovery SDK
              </button>
            </div>
          )}

          {(status === 'loading' || status === 'ready') && !showCustomUI && (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              onLoad={handleIframeLoad}
              className="w-full h-full border-0"
              style={{ minHeight: 'calc(100vh - 120px)' }}
              title="DNA Behavior Discovery SDK"
              allow="camera; microphone"
            />
          )}

          {/* Custom results UI shown after completion */}
          {showCustomUI && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-950 to-primary-950 p-8">
              <div className="max-w-lg w-full text-center">
                <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-900/50">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Assessment Complete!</h2>
                <p className="text-primary-300 mb-8 text-lg">
                  This is your <strong className="text-white">custom results UI</strong> — triggered when the SDK fires the{' '}
                  <code className="bg-white/10 px-2 py-0.5 rounded text-primary-200 text-sm">screenChanged: dashboard</code>{' '}
                  event.
                </p>
                <div className="bg-white/10 rounded-2xl p-6 text-left mb-8 border border-white/10">
                  <p className="text-primary-200 text-sm mb-3 font-medium">What just happened:</p>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                      The SDK iframe detected the user reached the dashboard screen
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                      It fired a <code className="text-primary-300">postMessage</code> event with type "screenChanged"
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                      Your app intercepted the event and replaced the iframe with this custom UI
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                      Your webhook endpoint received the completion data in real time
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors border border-white/20"
                  >
                    Restart Demo
                  </button>
                  <Link
                    to="/webhooks"
                    className="px-6 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
                  >
                    See Webhook Data
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Event Log Panel */}
        <div className="lg:w-80 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-white">SDK Event Log</h3>
            <p className="text-xs text-gray-500 mt-0.5">Real-time postMessage events</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {events.length === 0 ? (
              <div className="text-xs text-gray-600 text-center pt-8">
                Events will appear here once the SDK is launched
              </div>
            ) : (
              events.map((e, i) => (
                <div key={i} className="bg-gray-900 rounded-lg p-3 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-primary-400">{e.event}</span>
                    <span className="text-gray-600">{e.time}</span>
                  </div>
                  {e.detail && <span className="text-gray-400">{e.detail}</span>}
                </div>
              ))
            )}
          </div>

          {/* Config summary */}
          <div className="border-t border-gray-700 p-4">
            <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">Active Config</p>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Account ID</span>
                <span className="text-gray-300 font-mono">{config.accountId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pattern</span>
                <span className="text-gray-300">{config.questionPattern} questions</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-300 truncate max-w-[140px]">{config.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

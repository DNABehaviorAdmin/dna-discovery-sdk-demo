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

type EventType = 'info' | 'send' | 'receive' | 'error' | 'diagnostic';
const eventLog: Array<{ time: string; title: string; detail?: string; type: EventType }> = [];

export default function Demo() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimeoutRef = useRef<number>(null);
  const [config] = useState<SDKConfig | null>(loadConfig);
  const [status, setStatus] = useState<DemoStatus>('idle');
  const [events, setEvents] = useState(eventLog);
  const [showCustomUI, setShowCustomUI] = useState(false);

  const addEvent = (title: string, detail?: string, type: EventType = 'info') => {
    const entry = { time: new Date().toLocaleTimeString(), title, detail, type };
    eventLog.push(entry);
    setEvents([...eventLog]);
  };

  const showDiagnosticInfo = (reason: string) => {
    addEvent(
      'DIAGNOSTIC LOG',
      `[PLEASE COPY THIS AND SHARE WITH SUPPORT]\n----------------------------------------\nReason: ${reason}\nTime: ${new Date().toISOString()}\nTarget: ${SDK_BASE_URL}\nAccount: ${config?.accountId}\nPattern: ${config?.questionPattern}\nEmail: ${config?.email}`,
      'diagnostic'
    );
  };

  // Clean up load timeout on unmount
  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) window.clearTimeout(loadTimeoutRef.current);
    };
  }, []);

  // Listen for postMessage events from the SDK iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.origin !== SDK_BASE_URL.replace(/\/$/, '') && !e.origin.includes('localhost') && !e.origin.includes('127.0.0.1')) {
         return; // Ignore completely unknown origins
      }
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        
        // Detailed logging for all incoming events
        if (data && typeof data === 'object') {
          if (data.type === 'screenChanged') {
            addEvent('screenChanged', `value: "${data.value}"`, 'receive');
            if (data.value === 'dashboard') {
              setShowCustomUI(true);
              setStatus('completed');
              addEvent('Assessment complete!', 'Displaying custom results UI', 'info');
            }
          } else if (data.type === 'error' || data.error) {
            addEvent('SDK Error', JSON.stringify(data, null, 2), 'error');
            setStatus('error');
          } else {
            addEvent(`SDK Event: ${data.type || 'message'}`, JSON.stringify(data, null, 2), 'receive');
          }
        } else {
          addEvent('Raw Message', String(e.data), 'receive');
        }
      } catch {
        addEvent('Non-JSON Message', String(e.data), 'error');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleIframeLoad = () => {
    if (!config || !iframeRef.current) return;
    setStatus('ready');
    addEvent('Iframe Loaded', 'The <iframe> document finished loading.', 'info');
    
    addEvent('Pre-encryption Check', `API Key (Subscription): ${config.subscriptionKey}\n\nPublic Key (Encryption):\n${config.encryptionKey}`, 'info');

    if (loadTimeoutRef.current) {
      window.clearTimeout(loadTimeoutRef.current);
    }

    const encryptedKey = encryptKey(config.subscriptionKey, config.encryptionKey);
    if (!encryptedKey) {
      addEvent('Encryption Failed', 'Check your encryption key format', 'error');
      showDiagnosticInfo('RSA Encryption returned false');
      setStatus('error');
      return;
    }

    iframeRef.current.contentWindow?.postMessage(encryptedKey, SDK_BASE_URL);
    addEvent('postMessage Sent', `Encrypted Payload Sent to iframe:\n${encryptedKey}`, 'send');
  };

  const handleLaunch = () => {
    setStatus('loading');
    setShowCustomUI(false);
    eventLog.length = 0;
    setEvents([]);
    addEvent('Launch Initialized', `Params:
Email: ${config?.email}
Account: ${config?.accountId}
Pattern: ${config?.questionPattern}
SelfRegID: ${config?.selfRegistrationId}`, 'info');
    addEvent('Iframe SRC', `Target URL: ${SDK_BASE_URL}`, 'info');

    // Set a timeout to catch if the iframe never fires the onLoad event
    loadTimeoutRef.current = window.setTimeout(() => {
      setStatus('error');
      addEvent('Timeout', 'The SDK iframe took too long to load or was blocked by the browser.', 'error');
      showDiagnosticInfo('Iframe load timeout (10s)');
    }, 10000);
  };

  const handleReset = () => {
    if (loadTimeoutRef.current) window.clearTimeout(loadTimeoutRef.current);
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
            to="/"
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
              to="/"
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
              <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary-600 to-primary-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary-900/50">
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
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-950 to-primary-950 p-8">
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
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {events.length === 0 ? (
              <div className="text-xs text-gray-500 text-center pt-8">
                Click Launch to start tracing events
              </div>
            ) : (
              events.map((e, i) => {
                const isSend = e.type === 'send';
                const isReceive = e.type === 'receive';
                const isError = e.type === 'error';
                const isDiagnostic = e.type === 'diagnostic';

                const badgeColor = isSend
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                  : isReceive
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : isError
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : isDiagnostic
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                  : 'bg-gray-700/50 text-gray-400 border-gray-600/50';

                const badgeText = isSend
                  ? 'SENT ↗'
                  : isReceive
                  ? 'RECV ↙'
                  : isError
                  ? 'ERROR ✖'
                  : isDiagnostic
                  ? 'DIAG ⚡'
                  : 'INFO i';

                const titleColor = isError || isDiagnostic ? 'text-red-400' : 'text-gray-200';
                const borderColor = isDiagnostic ? 'border-orange-500/50 shadow-[0_0_15px_-3px_rgba(249,115,22,0.2)]' : isError ? 'border-red-500/30' : 'border-gray-800';
                const bgClass = isDiagnostic ? 'bg-orange-950/20' : isError ? 'bg-red-950/20' : 'bg-gray-900';

                return (
                  <div key={i} className={`rounded-xl p-3 text-xs border ${borderColor} ${bgClass}`}>
                    <div className="flex items-start justify-between mb-2 gap-3">
                      <div className="flex items-center gap-2 flex-wrap flex-1">
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${badgeColor} font-bold tracking-wider shrink-0`}>
                          {badgeText}
                        </span>
                        <span className={`font-mono font-medium ${titleColor} break-all`}>
                          {e.title}
                        </span>
                      </div>
                      <span className="text-gray-600 text-[10px] shrink-0 pt-0.5">{e.time}</span>
                    </div>
                    {e.detail && (
                      <div className={`wrap-break-word whitespace-pre-wrap font-mono text-[10px] p-2.5 rounded overflow-x-auto ${isDiagnostic ? 'bg-orange-950/40 text-orange-200/90 font-bold border border-orange-500/20' : 'bg-gray-950/60 text-gray-400'}`}>
                        {e.detail}
                      </div>
                    )}
                  </div>
                );
              })
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

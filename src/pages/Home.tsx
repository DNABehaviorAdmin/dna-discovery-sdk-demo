import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Code2,
  Shield,
  Zap,
  Globe,
  BarChart2,
  Webhook,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

const features = [
  {
    icon: <Code2 className="w-5 h-5" />,
    title: 'Simple iframe Embed',
    desc: 'Drop a single <iframe> tag into any HTML-based app — React, Angular, Vue, Svelte, Solid.js — and you\'re running.',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Secure by Design',
    desc: 'Credentials stay in your key vault. The subscription key is RSA-encrypted before it ever leaves your server.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Auto Progress Saving',
    desc: 'Users can leave mid-assessment and return right where they left off — no lost data, no restarts.',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: '14 Languages',
    desc: 'English, Spanish, French, German, Mandarin, Hindi, Portuguese, Afrikaans, Dutch, Urdu and more.',
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: 'Custom Results UI',
    desc: 'Listen for the screenChanged event and replace the default dashboard with your own branded results screen.',
  },
  {
    icon: <Webhook className="w-5 h-5" />,
    title: 'Real-Time Webhooks',
    desc: 'Get a JSON payload the moment a user completes their profile — perfect for CRM sync and workflow automation.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Store Your Credentials',
    desc: 'Securely store your Account ID, Subscription Key, and Encryption Key in AWS Secrets Manager, Azure Key Vault, or an environment file.',
    detail: 'Never hard-code credentials. Always keep them server-side.',
  },
  {
    number: '02',
    title: 'Encrypt the Subscription Key',
    desc: 'Use jsencrypt with the public key DNA Behavior provides to RSA-encrypt your subscription key before passing it to the iframe.',
    detail: 'The encryption ensures your key is safe in transit.',
  },
  {
    number: '03',
    title: 'Embed the iframe',
    desc: 'Add the <iframe> tag with the required parameters: accountId, selfRegistrationId, questionPattern, firstname, lastname, email.',
    detail: 'For best UX, render the iframe full-screen on its own route.',
  },
  {
    number: '04',
    title: 'Post the Encrypted Key',
    desc: 'Once the iframe loads, use postMessage to send the encrypted subscription key to the embed origin.',
    detail: 'This handshake authorizes the session securely.',
  },
  {
    number: '05',
    title: 'Listen for Completion',
    desc: 'Subscribe to the screenChanged event. When value equals "dashboard", the assessment is done — show your custom results UI.',
    detail: 'Full control over the post-assessment experience.',
  },
];

const questionPatterns = [
  { pattern: '11', label: '11 Questions', time: '~3 min', desc: 'Quick behavioral snapshot, ideal for initial onboarding.' },
  { pattern: '17', label: '17 Questions', time: '~5 min', desc: 'Balanced depth — great for most client workflows.' },
  { pattern: '46', label: '46 Questions', time: '~12 min', desc: 'Full discovery. The most detailed behavioral profile.' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-950 to-primary-900 text-white">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, #a855f7 0%, transparent 50%), radial-gradient(circle at 75% 20%, #6366f1 0%, transparent 50%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              Discovery SDK — Production Ready
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6">
              Embed Behavioral{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-400">
                Discovery
              </span>{' '}
              Into Your App
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
              The DNA Behavior Discovery SDK lets you deliver world-class behavioral assessments inside your own product — with your own branding, your own flow, and real-time data back to your systems.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/demo"
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 rounded-xl font-semibold transition-colors"
              >
                Try the Live Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/setup"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition-colors"
              >
                Setup Guide <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Everything you need, nothing you don't</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            A minimal, secure integration that gives you full control over the user experience.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-gray-200 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-gray-500 text-lg">Five steps from zero to a fully embedded behavioral assessment.</p>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-primary-200 hidden sm:block" />
            <div className="space-y-10">
              {steps.map((step, i) => (
                <div key={i} className={`relative flex flex-col sm:flex-row gap-6 items-start ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
                  {/* Number bubble */}
                  <div className="sm:w-1/2 flex justify-start sm:justify-end">
                    <div className={`flex items-start gap-4 max-w-sm ${i % 2 === 1 ? 'sm:ml-8' : 'sm:mr-8'}`}>
                      {i % 2 === 0 && (
                        <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-200">
                          {step.number}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{step.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-2">{step.desc}</p>
                        <p className="text-xs text-primary-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {step.detail}
                        </p>
                      </div>
                      {i % 2 === 1 && (
                        <div className="relative z-10 w-16 h-16 rounded-2xl bg-primary-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-200">
                          {step.number}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="sm:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Question Patterns */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Choose your assessment depth</h2>
          <p className="text-gray-500 text-lg">Three question patterns to match your client journey.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {questionPatterns.map((qp) => (
            <div key={qp.pattern} className={`p-8 rounded-2xl border-2 text-center transition-all ${qp.pattern === '17' ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100' : 'border-gray-200 hover:border-primary-200'}`}>
              {qp.pattern === '17' && (
                <div className="inline-block bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">Most Popular</div>
              )}
              <div className="text-5xl font-bold text-gray-900 mb-1">{qp.pattern}</div>
              <div className="text-primary-600 font-semibold mb-1">{qp.label}</div>
              <div className="text-sm text-gray-400 mb-4">{qp.time}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{qp.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-400 mt-6">
          Note: If a user completes an 11 or 17 question assessment and later takes the full 46-question discovery, a different email address is required.
        </p>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-900 to-primary-900 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to build?</h2>
          <p className="text-lg text-primary-200 mb-10">
            Enter your SDK credentials and see the full embedded experience in action — right here in this demo app.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/setup"
              className="px-8 py-3.5 bg-white text-primary-900 font-bold rounded-xl hover:bg-primary-50 transition-colors"
            >
              Start Setup
            </Link>
            <Link
              to="/code"
              className="px-8 py-3.5 bg-white/10 border border-white/20 font-semibold rounded-xl hover:bg-white/20 transition-colors"
            >
              View Code Examples
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

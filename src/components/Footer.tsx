import { Dna, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary-500 to-primary-500 flex items-center justify-center">
                <Dna className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">DNA Behavior</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              The Discovery SDK lets you embed behavioral assessments directly into your application — creating a seamless, branded experience for your users.
            </p>
          </div>

          {/* Demo Links */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Demo Pages</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Setup Guide</Link></li>
              <li><Link to="/demo" className="hover:text-white transition-colors">Live Sandbox</Link></li>
              <li><Link to="/webhooks" className="hover:text-white transition-colors">Webhook Reference</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-3 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://dnabehavior.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  DNA Behavior Website <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://behaviorallyconnected.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  Interactive Guide <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://developer.dnabehavior.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  Developer Portal <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p>&copy; {new Date().getFullYear()} DNA Behavior Solutions, LLC. All rights reserved.</p>
          <p>SDK Demo Application — For Client Presentations</p>
        </div>
      </div>
    </footer>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Demo from './pages/Demo';
import CodeExamples from './pages/CodeExamples';
import Webhooks from './pages/Webhooks';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Demo page gets its own full-screen layout (no footer during active session)
function DemoLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Demo />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/setup" element={<Layout><Setup /></Layout>} />
        <Route path="/demo" element={<DemoLayout />} />
        <Route path="/code" element={<Layout><CodeExamples /></Layout>} />
        <Route path="/webhooks" element={<Layout><Webhooks /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}

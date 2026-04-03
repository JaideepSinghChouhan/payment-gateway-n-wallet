import { Link } from "react-router-dom";
import { ArrowRight, Wallet, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-violet-600 rounded-full blur-[100px]" />
      </div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
          <Wallet className="w-8 h-8 text-indigo-400" />
          N-Wallet
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium hover:text-indigo-400 transition-colors">Log In</Link>
          <Link to="/register">
            <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-6 border-none">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Payment Infrastructure for the Modern Web
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60 mb-6">
          The future of digital <br /> transactions is here.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10">
          Seamlessly transfer funds to peers, top up your wallet, and manage merchant payments within one unified, highly secure ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register">
            <Button size="lg" className="bg-white text-black hover:bg-slate-200 h-14 px-8 text-lg rounded-full w-full sm:w-auto">
              Open your Wallet <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl w-full text-left">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Zap className="w-10 h-10 text-amber-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-slate-400">P2P transfers clear instantly. Move your money exactly when you need to without delays.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
            <p className="text-slate-400">Built with idempotency keys and military-grade encryption to protect every ledger entry.</p>
          </div>
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <Wallet className="w-10 h-10 text-indigo-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Merchant Portal</h3>
            <p className="text-slate-400">Generate payment links securely and easily withdraw your earnings directly to your bank.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

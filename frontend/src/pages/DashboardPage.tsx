import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, Send, Plus, Receipt, CreditCard, Loader2, TrendingUp, ArrowRightLeft, Store } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";
import NWalletIdCard from "@/components/NWalletIdCard";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState({ balance: "0.00", pendingBalance: "0.00", currency: "INR" });
  const [loading, setLoading] = useState(true);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);

  // Topup State
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  // Transfer State
  const [transferUserId, setTransferUserId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  useEffect(() => {
    fetchBalance();
    fetchRecentTxns();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await api.get("/wallet/balance");
      const amount = res.data.balance ?? res.data.ballance ?? "0.00";
      setBalance({ balance: String(amount), pendingBalance: "0.00", currency: res.data.currency || "INR" });
    } catch (e) {
      console.error("Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTxns = async () => {
    try {
      const res = await api.get("/transaction/transactions");
      const list = res.data.data || res.data;
      setRecentTxns(Array.isArray(list) ? list.slice(0, 5) : []);
    } catch (e) { /* silent */ }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setTopupLoading(true);
    try {
      await api.post(
        "/wallet/topup",
        { amount: parseFloat(topupAmount), currency: "INR" },
        { headers: { "idempotency-key": crypto.randomUUID() } }
      );
      setTopupAmount("");
      setIsTopupOpen(false);
      fetchBalance();
      fetchRecentTxns();
    } catch (err: any) {
      alert(err.response?.data?.error || "Topup failed");
    } finally {
      setTopupLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferLoading(true);
    try {
      await api.post(
        "/wallet/transfer",
        { toUserId: transferUserId, amount: parseFloat(transferAmount), currency: "INR" },
        { headers: { "idempotency-key": crypto.randomUUID() } }
      );
      setTransferUserId("");
      setTransferAmount("");
      setIsTransferOpen(false);
      fetchBalance();
      fetchRecentTxns();
    } catch (err: any) {
      alert(err.response?.data?.error || "Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const txnTypeColor = (type: string) => {
    if (type === "TOPUP") return "text-emerald-400";
    if (type === "PAYMENT") return "text-red-400";
    return "text-slate-300";
  };

  const txnSign = (type: string) => {
    if (type === "TOPUP") return "+";
    if (type === "PAYMENT" || type === "TRANSFER") return "-";
    return "";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Wallet className="w-6 h-6 text-indigo-400" />
            N-Wallet
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 hidden sm:block">{user?.email}</span>
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 border-none shadow-none">
                Transactions
              </Button>
            </Link>
            <Link to="/pay">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 border-none shadow-none">
                Pay Order
              </Button>
            </Link>
            {user?.merchant ? (
              <Link to="/merchant/dashboard">
                <Button size="sm" className="bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-300 shadow-none">
                  <Store className="w-4 h-4 mr-1" /> Merchant Hub
                </Button>
              </Link>
            ) : (
              <Link to="/merchant">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 border-none shadow-none">
                  Become Merchant
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-300 hover:text-white hover:bg-white/10 border-none shadow-none">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Main Balance Card */}
          <Card className="md:col-span-2 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-slate-900 border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
            <CardHeader className="relative z-10 border-none">
              <CardDescription className="text-indigo-200/70 font-medium tracking-wide uppercase text-xs">Total Balance</CardDescription>
              <CardTitle className="text-5xl text-white font-extrabold tracking-tighter">
                {loading
                  ? <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  : <span className="flex items-baseline gap-1"><span className="text-5xl text-indigo-400">₹</span>{balance.balance}</span>
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 block mt-4 border-none">
              <div className="flex flex-wrap gap-3">
                {/* Top Up Dialog */}
                <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6 shadow-lg shadow-indigo-900/50 border-none">
                      <Plus className="w-4 h-4 mr-2" /> Quick Topup
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                    <DialogHeader className="border-none">
                      <DialogTitle>Add Funds</DialogTitle>
                      <DialogDescription className="text-slate-400">Top up your wallet instantly.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleTopup} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (INR)</Label>
                        <Input
                          id="amount" type="number" step="0.01" placeholder="e.g. 500.00"
                          className="bg-black/50 border-white/10 text-2xl py-6 focus-visible:ring-indigo-500"
                          value={topupAmount}
                          onChange={(e) => setTopupAmount(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={topupLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 border-none">
                        {topupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Deposit"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Transfer Dialog */}
                <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="bg-white/10 text-white hover:bg-white/20 rounded-full px-6 backdrop-blur-md border-none">
                      <Send className="w-4 h-4 mr-2" /> Send Money
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                    <DialogHeader className="border-none">
                      <DialogTitle>Send Money</DialogTitle>
                      <DialogDescription className="text-slate-400">Instantly transfer funds to another user's wallet.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleTransfer} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="userId">Recipient User ID</Label>
                        <Input
                          id="userId" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          className="bg-black/50 border-white/10 focus-visible:ring-indigo-500"
                          value={transferUserId}
                          onChange={(e) => setTransferUserId(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transferAmount">Amount (INR)</Label>
                        <Input
                          id="transferAmount" type="number" step="0.01" placeholder="0.00"
                          className="bg-black/50 border-white/10 text-xl py-5 focus-visible:ring-indigo-500"
                          value={transferAmount}
                          onChange={(e) => setTransferAmount(e.target.value)}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={transferLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 border-none">
                        {transferLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Funds"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Pay Order shortcut */}
                <Link to="/pay">
                  <Button variant="secondary" className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 rounded-full px-6 border border-violet-500/20">
                    <CreditCard className="w-4 h-4 mr-2" /> Pay Order
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* N-Wallet ID Card */}
          <NWalletIdCard nWalletId={user?.nWalletId} />

          {/* Recent Transactions */}
          <Card className="md:col-span-3 bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader className="border-none flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <TrendingUp className="w-5 h-5 text-indigo-400" /> Recent Transactions
              </CardTitle>
              <Link to="/transactions">
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white border-none text-xs">
                  View All →
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="border-none">
              {recentTxns.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No transactions yet. Try a topup!</p>
              ) : (
                <div className="space-y-2">
                  {recentTxns.map((tx: any) => (
                    <div key={tx.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          {tx.type === "TOPUP" && <Plus className="w-4 h-4 text-emerald-400" />}
                          {tx.type === "PAYMENT" && <CreditCard className="w-4 h-4 text-violet-400" />}
                          {tx.type === "TRANSFER" && <Send className="w-4 h-4 text-blue-400" />}
                          {!["TOPUP", "PAYMENT", "TRANSFER"].includes(tx.type) && <Receipt className="w-4 h-4 text-slate-400" />}
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">{tx.type}</p>
                          <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${txnTypeColor(tx.type)}`}>
                          {txnSign(tx.type)}₹{parseFloat(tx.amount || 0).toFixed(2)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${tx.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Store, Wallet, Plus, Copy, Check, ArrowUpRight,
  Loader2, Key, Receipt, TrendingUp, Send, CreditCard,
  User, ChevronDown, LogOut, ArrowRightLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import NWalletIdCard from "@/components/NWalletIdCard";

export default function MerchantDashboardPage() {
  const { user, logout } = useAuth();
  const merchant = user?.merchant;

  const [balance, setBalance] = useState("0.00");
  const [pendingBalance, setPendingBalance] = useState("0.00");
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [txns, setTxns] = useState<any[]>([]);
  const [txnsLoading, setTxnsLoading] = useState(true);

  // Avatar dropdown
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Create Order
  const [orderAmount, setOrderAmount] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState<string | null>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  // Withdraw
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Topup (wallet funding)
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  // Transfer
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
    fetchTxns();
  }, []);

  // Close avatar dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await api.get("/wallet/balance");
      const amount = res.data.balance ?? res.data.ballance ?? "0.00";
      setBalance(String(amount));
      setPendingBalance(String(res.data.pendingBalance ?? "0.00"));
    } catch (e) { /* silent */ }
    finally { setBalanceLoading(false); }
  };

  const fetchTxns = async () => {
    try {
      const res = await api.get("/transaction/transactions");
      const list = res.data.data || res.data;
      setTxns(Array.isArray(list) ? list.slice(0, 8) : []);
    } catch (e) { /* silent */ }
    finally { setTxnsLoading(false); }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setGeneratedOrderId(null);
    const apiKey = merchant?.apiKey;
    if (!apiKey) { alert("No API key found."); setOrderLoading(false); return; }
    try {
      const res = await api.post(
        "/merchant/orders",
        { amount: parseFloat(orderAmount), currency: "INR" },
        { headers: { "x-api-key": apiKey } }
      );
      const order = res.data.paymentOrder || res.data.order || res.data;
      setGeneratedOrderId(order.id);
      setOrderAmount("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create order");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    try {
      await api.post("/merchant/withdraw", { amount: parseFloat(withdrawAmount), currency: "INR" });
      setWithdrawAmount("");
      setIsWithdrawOpen(false);
      fetchBalance();
      fetchTxns();
      alert("Withdrawal initiated!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to withdraw");
    } finally { setWithdrawLoading(false); }
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
      fetchTxns();
    } catch (err: any) {
      alert(err.response?.data?.error || "Topup failed");
    } finally { setTopupLoading(false); }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferLoading(true);
    try {
      await api.post(
        "/wallet/transfer",
        { toUserId: transferTo, amount: parseFloat(transferAmount), currency: "INR" },
        { headers: { "idempotency-key": crypto.randomUUID() } }
      );
      setTransferTo(""); setTransferAmount("");
      setIsTransferOpen(false);
      fetchBalance(); fetchTxns();
    } catch (err: any) {
      alert(err.response?.data?.error || "Transfer failed");
    } finally { setTransferLoading(false); }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const statusStyle = (s: string) =>
    s === "SUCCESS" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
    : s === "PENDING" ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
    : "bg-red-500/20 text-red-400 border-red-500/30";

  const txIcon = (type: string) => {
    if (type === "TOPUP") return <Plus className="w-4 h-4 text-emerald-400" />;
    if (type === "PAYMENT") return <CreditCard className="w-4 h-4 text-violet-400" />;
    if (type === "TRANSFER") return <Send className="w-4 h-4 text-blue-400" />;
    if (type === "WITHDRAWL") return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
    return <Receipt className="w-4 h-4 text-slate-400" />;
  };

  const txSign = (tx: any) =>
    tx.direction === "RECEIVED" ? "+" : "-";

  const txColor = (tx: any) =>
    tx.direction === "RECEIVED" ? "text-emerald-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand + role badge */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <Store className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-lg">{merchant?.name || "Merchant Hub"}</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20 font-medium">Merchant</span>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10 border-none text-sm hidden sm:flex">
                <Receipt className="w-4 h-4 mr-1" /> Transactions
              </Button>
            </Link>
            <Link to="/pay">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-white/10 border-none text-sm hidden sm:flex">
                <CreditCard className="w-4 h-4 mr-1" /> Pay Order
              </Button>
            </Link>

            {/* Avatar dropdown */}
            <div className="relative ml-2" ref={avatarRef}>
              <button
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                onClick={() => setAvatarOpen(!avatarOpen)}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                  {user?.email?.[0]?.toUpperCase() ?? "M"}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">{user?.email}</div>
                  <div className="text-xs text-indigo-400 font-mono">{user?.nWalletId || "Generating ID..."}</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${avatarOpen ? "rotate-180" : ""}`} />
              </button>

              {avatarOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm text-white truncate font-medium">{user?.email}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-indigo-400 font-mono truncate mr-2">{user?.nWalletId || "Generating ID..."}</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10 shrink-0"
                        onClick={(e) => { e.stopPropagation(); copyText(user?.nWalletId || "", "nwalletid"); }}>
                        {copied === "nwalletid" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Balance + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* N-Wallet ID */}
          <NWalletIdCard nWalletId={user?.nWalletId} />

          {/* Balance Card */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-slate-900 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
            <CardHeader className="border-none relative z-10">
              <CardDescription className="text-indigo-200/70 uppercase tracking-widest text-xs font-medium">Wallet Balance</CardDescription>
              <CardTitle className="text-5xl font-extrabold text-white tracking-tighter mt-1">
                {balanceLoading
                  ? <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  : <span className="flex items-baseline gap-1"><span className="text-3xl text-indigo-400">₹</span>{balance}</span>
                }
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 border-none">
              
              {/* Pending Balance Indicator */}
              <div className="mb-6 mt-1 flex items-center gap-2 bg-black/20 self-start inline-flex rounded-lg px-3 py-1.5 border border-white/5">
                <span className="text-xs text-slate-400">Pending Settlement:</span>
                <span className="text-sm text-amber-400 font-semibold">₹{pendingBalance}</span>
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5 mt-2">

                {/* Create Payment Order */}
                <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-indigo-600 hover:bg-indigo-500 rounded-full px-5 border-none shadow-lg shadow-indigo-900/40">
                      <Plus className="w-4 h-4 mr-2" /> Create Payment Link
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader className="border-none">
                      <DialogTitle>Create Payment Order</DialogTitle>
                      <DialogDescription className="text-slate-400">Set an amount and share the Order ID with your customer to collect payment.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateOrder} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Amount (INR)</Label>
                        <Input type="number" step="0.01" placeholder="e.g. 299.00"
                          className="bg-black/50 border-white/10 text-xl py-5 focus-visible:ring-indigo-500"
                          value={orderAmount} onChange={(e) => setOrderAmount(e.target.value)} required />
                      </div>
                      <Button type="submit" disabled={orderLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 border-none h-11">
                        {orderLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Order"}
                      </Button>
                    </form>
                    {generatedOrderId && (
                      <div className="mt-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-3">
                        <p className="text-sm text-emerald-400 font-semibold flex items-center gap-2">
                          <Check className="w-4 h-4" /> Order ready! Share this ID with your customer.
                        </p>
                        <div className="flex gap-2 items-center bg-black/40 rounded-lg p-2 border border-white/5">
                          <code className="flex-1 text-xs font-mono text-slate-200 break-all">{generatedOrderId}</code>
                          <Button variant="ghost" size="icon" onClick={() => copyText(generatedOrderId, "order")} className="shrink-0 hover:bg-white/10 h-7 w-7">
                            {copied === "order" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500">Customer: <span className="text-indigo-400">N-Wallet → Pay Order → paste ID → Pay Now</span></p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Withdraw */}
                <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white/10 hover:bg-white/20 rounded-full px-5 border-none">
                      <ArrowUpRight className="w-4 h-4 mr-2 text-amber-400" /> Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader className="border-none">
                      <DialogTitle>Withdraw Earnings</DialogTitle>
                      <DialogDescription className="text-slate-400">Transfer your merchant balance to your bank.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleWithdraw} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Amount (INR)</Label>
                        <Input type="number" step="0.01"
                          className="bg-black/50 border-white/10 text-xl py-5 focus-visible:ring-amber-500"
                          value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} required />
                      </div>
                      <Button type="submit" disabled={withdrawLoading} className="w-full bg-amber-600 hover:bg-amber-500 border-none h-11">
                        {withdrawLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initiate Withdrawal"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Topup */}
                <Dialog open={isTopupOpen} onOpenChange={setIsTopupOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white/10 hover:bg-white/20 rounded-full px-5 border-none">
                      <Wallet className="w-4 h-4 mr-2 text-emerald-400" /> Add Funds
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader className="border-none">
                      <DialogTitle>Add Funds to Wallet</DialogTitle>
                      <DialogDescription className="text-slate-400">Top up your wallet balance.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleTopup} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Amount (INR)</Label>
                        <Input type="number" step="0.01" placeholder="e.g. 500.00"
                          className="bg-black/50 border-white/10 text-xl py-5 focus-visible:ring-indigo-500"
                          value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} required />
                      </div>
                      <Button type="submit" disabled={topupLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 border-none h-11">
                        {topupLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Deposit"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Transfer */}
                <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white/10 hover:bg-white/20 rounded-full px-5 border-none">
                      <Send className="w-4 h-4 mr-2 text-sky-400" /> Send Money
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-white/10 text-white">
                    <DialogHeader className="border-none">
                      <DialogTitle>Send Money</DialogTitle>
                      <DialogDescription className="text-slate-400">Transfer funds to another user's wallet.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleTransfer} className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label>Recipient N-Wallet ID</Label>
                        <Input placeholder="e.g. john@nwallet"
                          className="bg-black/50 border-white/10 focus-visible:ring-indigo-500 font-mono text-sm"
                          value={transferTo} onChange={(e) => setTransferTo(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Amount (INR)</Label>
                        <Input type="number" step="0.01"
                          className="bg-black/50 border-white/10 text-xl py-5 focus-visible:ring-indigo-500"
                          value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} required />
                      </div>
                      <Button type="submit" disabled={transferLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 border-none h-11">
                        {transferLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Funds"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* API Keys Card */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
            <CardHeader className="border-none">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Key className="w-4 h-4 text-amber-400" /> API Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 border-none">
              <div>
                <p className="text-xs text-slate-400 mb-1">API Key (Secret)</p>
                <div className="flex gap-2">
                  <Input readOnly type="password" value={merchant?.apiKey || ""}
                    className="bg-black/50 border-white/10 font-mono text-xs h-8" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 shrink-0"
                    onClick={() => copyText(merchant?.apiKey || "", "apikey")}>
                    {copied === "apikey" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-1">Merchant ID</p>
                <div className="flex gap-2 items-start">
                  <p className="font-mono text-xs text-slate-300 break-all flex-1">{merchant?.id}</p>
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/10 shrink-0"
                    onClick={() => copyText(merchant?.id || "", "mid")}>
                    {copied === "mid" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
              <Link to="/pay">
                <Button className="w-full bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-violet-300 mt-2">
                  <CreditCard className="w-4 h-4 mr-2" /> Pay an Order
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="border-none flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-indigo-400" /> Recent Activity
            </CardTitle>
            <Link to="/transactions">
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white border-none text-xs">
                View All →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="border-none">
            {txnsLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : txns.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No activity yet. Create your first payment link!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {txns.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-black/20 border border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg">{txIcon(tx.type)}</div>
                      <div>
                        <p className="text-sm text-white font-medium">{tx.type}</p>
                        <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${txColor(tx)}`}>
                        {txSign(tx)}₹{parseFloat(tx.amount || 0).toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

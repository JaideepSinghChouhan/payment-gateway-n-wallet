import { useState } from "react";
import { Link } from "react-router-dom";
import { Store, Key, ArrowUpRight, Copy, Check, Link as LinkIcon, Loader2, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

export default function MerchantPage() {
  const { user, login } = useAuth();
  
  // Onboarding state
  const [businessName, setBusinessName] = useState("");
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  // Merchant actions state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  const [orderAmount, setOrderAmount] = useState("");
  const [orderLoading, setOrderLoading] = useState(false);
  const [generatedOrder, setGeneratedOrder] = useState<any>(null);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  const [copied, setCopied] = useState(false);

  const isMerchant = !!user?.merchant;

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardingLoading(true);
    try {
      const res = await api.post("/merchant/merchants", { name: businessName });
      login({ ...user, merchant: res.data.merchant || res.data });
      // Redirect to dedicated merchant dashboard
      window.location.href = "/merchant/dashboard";
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create merchant account");
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawLoading(true);
    try {
      await api.post("/merchant/withdraw", { amount: parseFloat(withdrawAmount), currency: "USD" });
      setIsWithdrawOpen(false);
      setWithdrawAmount("");
      alert("Withdrawal successfully processed!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to withdraw funds");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setGeneratedOrder(null);
    try {
      const apiKey = user?.merchant?.apiKey;
      if (!apiKey) {
        alert("Could not find your merchant API key. Please refresh and try again.");
        return;
      }
      const res = await api.post(
        "/merchant/orders",
        { amount: parseFloat(orderAmount), currency: "USD" },
        { headers: { "x-api-key": apiKey } }
      );
      setGeneratedOrder(res.data.paymentOrder || res.data.order || res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create payment link");
    } finally {
      setOrderLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Store className="w-6 h-6 text-indigo-400" />
            Merchant Portal
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 border-none shadow-none">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {!isMerchant ? (
          <Card className="bg-white/5 border-white/10 backdrop-blur-xl max-w-lg mx-auto mt-12 shadow-2xl">
            <CardHeader className="text-center border-none">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                  <Store className="w-12 h-12 text-indigo-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Become a Merchant</CardTitle>
              <CardDescription className="text-slate-400">
                Unlock tools to generate payment links and withdraw business earnings directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOnboard} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName" 
                    placeholder="e.g. Acme Corp"
                    className="bg-black/50 border-white/10 text-white focus-visible:ring-indigo-500 py-6 text-lg"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={onboardingLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none mt-4 h-12">
                  {onboardingLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Merchant Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                  Welcome, <span className="text-indigo-400">{user.merchant?.name || "Merchant"}</span>
                </h1>
                <p className="text-slate-400">Manage your business payments and API keys.</p>
              </div>
              <div className="p-3 bg-indigo-500/10 rounded-full border border-indigo-500/30">
                <Store className="w-6 h-6 text-indigo-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API Key Card */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader className="border-none">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Key className="w-5 h-5 text-amber-400" /> Developer Keys
                  </CardTitle>
                </CardHeader>
                <CardContent className="border-none">
                  <div className="space-y-2">
                    <Label className="text-slate-400">Your API Key (Secret)</Label>
                    <div className="flex gap-2">
                      <Input 
                        readOnly 
                        type="password" 
                        value={user.merchant?.apiKey || "************************"} 
                        className="bg-black/50 border-white/10 font-mono text-slate-300"
                      />
                      <Button variant="outline" size="icon" onClick={() => copyToClipboard(user.merchant?.apiKey || "")} className="border-white/10 bg-transparent hover:bg-white/10 text-white">
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Keep this key extremely safe. Do not expose it in client-side code.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader className="border-none">
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Wallet className="w-5 h-5 text-emerald-400" /> Business Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Create Order Dialog */}
                  <Dialog open={isOrderOpen} onOpenChange={setIsOrderOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none shadow-none justify-start">
                        <LinkIcon className="w-4 h-4 mr-2 text-indigo-400" /> Generate Payment Link
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                      <DialogHeader className="border-none">
                        <DialogTitle>Create Payment Order</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Generate a unique order for a customer to pay.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateOrder} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="orderAmount">Charge Amount (USD)</Label>
                          <Input 
                            id="orderAmount" 
                            type="number" 
                            step="0.01"
                            className="bg-black/50 border-white/10 focus-visible:ring-indigo-500 text-xl py-5"
                            value={orderAmount}
                            onChange={(e) => setOrderAmount(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={orderLoading} className="w-full bg-indigo-600 hover:bg-indigo-500 border-none">
                          {orderLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate Order"}
                        </Button>
                      </form>
                      
                      {generatedOrder && (
                        <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                          <p className="text-sm font-medium text-emerald-400 mb-2">Order Created Successfully!</p>
                          <p className="text-xs text-slate-400 mb-1">Order ID:</p>
                          <code className="text-xs bg-black/50 p-2 rounded font-mono break-all inline-block w-full">{generatedOrder.id}</code>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  {/* Withdraw Dialog */}
                  <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none shadow-none justify-start">
                        <ArrowUpRight className="w-4 h-4 mr-2 text-amber-400" /> Withdraw Earnings
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-md">
                      <DialogHeader className="border-none">
                        <DialogTitle>Withdraw Funds</DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Transfer your merchant earnings out to your bank.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleWithdraw} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="withdrawAmount">Amount (USD)</Label>
                          <Input 
                            id="withdrawAmount" 
                            type="number" 
                            step="0.01"
                            className="bg-black/50 border-white/10 focus-visible:ring-amber-500 text-xl py-5"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={withdrawLoading} className="w-full bg-amber-600 hover:bg-amber-500 border-none">
                          {withdrawLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initiate Withdrawal"}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

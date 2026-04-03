import { useState } from "react";
import { Link } from "react-router-dom";
import { Wallet, CreditCard, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/axios";

type PaymentState = "idle" | "loading" | "success" | "error";

export default function PayOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [state, setState] = useState<PaymentState>("idle");
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await api.post(
        "/payment/pay",
        { orderId },
        { headers: { "idempotency-key": crypto.randomUUID() } }
      );
      setResult(res.data);
      setState("success");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || "Payment failed. Check the order ID and your balance.");
      setState("error");
    }
  };

  const reset = () => {
    setOrderId("");
    setState("idle");
    setResult(null);
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Wallet className="w-6 h-6 text-indigo-400" />
            N-Wallet
          </div>
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/10 border-none">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        {state === "success" ? (
          <div className="text-center max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                <CheckCircle className="w-16 h-16 text-emerald-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-slate-400 mb-6">Your payment has been processed and the merchant's wallet has been credited.</p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Amount Paid</span>
                <span className="text-emerald-400 font-semibold">₹{result?.amount ?? "--"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono text-xs break-all">{result?.transactionId ?? "--"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-400">{result?.status ?? "SUCCESS"}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={reset} variant="outline" className="flex-1 border-white/10 bg-transparent hover:bg-white/10 text-white">
                Pay Another
              </Button>
              <Link to="/dashboard" className="flex-1">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 border-none">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        ) : state === "error" ? (
          <div className="text-center max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-5 bg-red-500/20 rounded-full border border-red-500/30">
                <XCircle className="w-16 h-16 text-red-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
            <p className="text-slate-400 mb-4">{errorMsg}</p>
            <Button onClick={reset} className="bg-indigo-600 hover:bg-indigo-500 border-none px-8">
              Try Again
            </Button>
          </div>
        ) : (
          <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
            <CardHeader className="border-none text-center">
              <div className="flex justify-center mb-3">
                <div className="p-4 bg-violet-500/20 rounded-full border border-violet-500/30">
                  <CreditCard className="w-10 h-10 text-violet-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Pay a Merchant</CardTitle>
              <CardDescription className="text-slate-400">
                Enter the Order ID shared by the merchant to complete your payment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePay} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="orderId" className="text-slate-300">Order ID</Label>
                  <Input
                    id="orderId"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="bg-black/40 border-white/10 text-white font-mono placeholder:text-slate-600 focus-visible:ring-violet-500 py-6"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-500">
                    The merchant will provide this ID from their dashboard
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={state === "loading"}
                  className="w-full bg-violet-600 hover:bg-violet-500 border-none h-12 text-base font-semibold"
                >
                  {state === "loading" ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                  ) : (
                    <><CreditCard className="w-5 h-5 mr-2" /> Pay Now</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

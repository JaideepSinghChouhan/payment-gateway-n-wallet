import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/axios";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", { email, password });
      navigate("/login?registered=true");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-white/5 border-white/10 text-white backdrop-blur-xl relative z-10 shadow-2xl">
        <CardHeader className="space-y-3">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <Wallet className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Join N-Wallet to seamlessly manage transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-300 bg-red-500/20 rounded-md border border-red-500/30">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input 
                id="password" 
                type="password" 
                className="bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                className="bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-medium mt-2 border-none">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/5 pt-6 text-sm text-slate-400">
          Already have an account? 
          <Link to="/login" className="ml-1 text-emerald-400 hover:text-emerald-300 font-medium">
            Log in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      login(response.data.user);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed check your credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <Card className="w-full max-w-md bg-white/5 border-white/10 text-white backdrop-blur-xl relative z-10 shadow-2xl">
        <CardHeader className="space-y-3">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
              <Wallet className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center text-slate-400">
            Enter your credentials to access your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="name@example.com"
                className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                className="bg-black/20 border-white/10 text-white focus-visible:ring-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 font-medium">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-white/5 pt-6 text-sm text-slate-400">
          Don't have an account? 
          <Link to="/register" className="ml-1 text-indigo-400 hover:text-indigo-300 font-medium">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Copy, Check, AtSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NWalletIdCardProps {
  nWalletId?: string;
}

export default function NWalletIdCard({ nWalletId }: NWalletIdCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!nWalletId) return;
    navigator.clipboard.writeText(nWalletId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
      <CardHeader className="border-none pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
            <AtSign className="w-4 h-4 text-indigo-400" />
          </div>
          Your N-Wallet ID
        </CardTitle>
      </CardHeader>
      <CardContent className="border-none space-y-3">
        <p className="text-xs text-slate-400">
          Share this ID so others can send you money instantly — no account details needed.
        </p>
        <div className="flex items-center justify-between bg-black/40 rounded-xl border border-white/10 px-4 py-3 gap-2">
          <span className="text-indigo-300 font-mono text-sm truncate">
            {nWalletId || "Generating..."}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-white/10 shrink-0"
            onClick={handleCopy}
            disabled={!nWalletId}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-400" />
            )}
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-emerald-400 text-center animate-pulse">
            ✓ Copied to clipboard!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

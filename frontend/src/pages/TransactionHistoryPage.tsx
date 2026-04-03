import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Wallet, ArrowUpRight, ArrowDownLeft, Receipt, ExternalLink, Loader2, ArrowLeftRight, CreditCard, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [txDetails, setTxDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/transaction/transactions");
      const fetchedList = res.data.data || res.data;
      setTransactions(Array.isArray(fetchedList) ? fetchedList : []);
    } catch (e) {
      console.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (txId: string) => {
    try {
      setDetailsLoading(true);
      setSelectedTx(txId);
      const res = await api.get(`/transaction/transactions/${txId}`);
      setTxDetails(res.data.transaction || res.data);
    } catch (e) {
      console.error("Failed to fetch details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case "PENDING": return "bg-amber-500/20 text-amber-400 border-amber-500/20";
      case "FAILED": return "bg-red-500/20 text-red-400 border-red-500/20";
      default: return "bg-slate-500/20 text-slate-400 border-slate-500/20";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "P2P": return <ArrowLeftRight className="w-4 h-4 text-indigo-400" />;
      case "TOPUP": return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case "WITHDRAWL": return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
      case "PAYMENT": return <CreditCard className="w-4 h-4 text-violet-400" />;
      case "REFUND": return <RefreshCcw className="w-4 h-4 text-pink-400" />;
      default: return <Receipt className="w-4 h-4 text-slate-400" />;
    }
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
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 border-none shadow-none">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-none">
            <CardTitle className="text-2xl text-white">Transaction History</CardTitle>
            <CardDescription className="text-slate-400">View all your incoming and outgoing ledger entries.</CardDescription>
          </CardHeader>
          <CardContent className="border-none">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </div>
            ) : (!transactions || transactions.length === 0) ? (
              <div className="text-center p-8 text-slate-400">
                No transactions found.
              </div>
            ) : (
              <div className="rounded-md border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-white/5">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-slate-300">Type</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Amount</TableHead>
                      <TableHead className="text-slate-300">Date</TableHead>
                      <TableHead className="text-right text-slate-300"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx: any) => (
                      <TableRow key={tx.id} onClick={() => openDetails(tx.id)} className="border-white/10 hover:bg-white/10 cursor-pointer transition-colors">
                        <TableCell className="font-medium text-white flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-full border border-white/5">
                            {getIcon(tx.type)}
                          </div>
                          {tx.type}
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-white">₹{parseFloat(tx.amount || 0).toFixed(2)}</TableCell>
                        <TableCell className="text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="hover:bg-white/10">
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Details Dialog */}
        <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
          <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-xl">
            <DialogHeader className="border-none">
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-400" />
                Transaction Details
              </DialogTitle>
            </DialogHeader>
            {detailsLoading || !txDetails ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </div>
            ) : (
              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="text-slate-400">Total Amount</div>
                  <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
                    ₹{parseFloat(txDetails.amount || 0).toFixed(2)} <span className="text-xl text-slate-400">{txDetails.currency}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 mb-1">Transaction ID</p>
                    <p className="font-mono text-xs break-all text-white">{txDetails.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Date</p>
                    <p className="text-white">{new Date(txDetails.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Status</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(txDetails.status)} inline-block`}>
                      {txDetails.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-1">Type</p>
                    <div className="flex items-center gap-1 text-white">
                      {getIcon(txDetails.type)}
                      <span>{txDetails.type}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/30 rounded-lg p-4 border border-white/5 space-y-3">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                    <Wallet className="w-4 h-4 text-slate-400" /> Ledger Information
                  </h4>
                  {txDetails.ledgerEntries?.map((entry: any) => (
                    <div key={entry.id} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0 last:pb-0">
                      <span className="text-slate-400">{entry.entryType}</span>
                      <span className={entry.entryType === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}>
                        {entry.entryType === 'CREDIT' ? '+' : '-'}₹{parseFloat(entry.amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  {(!txDetails.ledgerEntries || txDetails.ledgerEntries.length === 0) && (
                    <div className="text-xs text-slate-500">No underlying ledger entries generated yet.</div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Link, Shield, CheckCircle, Loader2, ExternalLink, Hash, Blocks, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useBlockchain } from "../blockchain/BlockchainContext";
import { shortenHash, getPolygonScanUrl, computeScreeningHash, computeReportHash } from "../blockchain/blockchainUtils";

interface BlockchainCardProps {
  screeningId: string;
  report: Record<string, unknown>;
  childName: string;
  riskLevel: string;
}

export function BlockchainCard({ screeningId, report, childName, riskLevel }: BlockchainCardProps) {
  const { wallet, isConnecting, connectWallet, anchorScreening, verifyScreening } = useBlockchain();
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingRecord = verifyScreening(screeningId);

  const hashes = useMemo(() => {
    if (existingRecord) {
      return { screening: existingRecord.screeningHash, report: existingRecord.reportHash };
    }
    return {
      screening: computeScreeningHash(screeningId),
      report: computeReportHash(report),
    };
  }, [screeningId, report, existingRecord]);

  const handleAnchor = async () => {
    if (!wallet) {
      await connectWallet();
      return;
    }

    setIsAnchoring(true);
    setError(null);
    try {
      const record = await anchorScreening(screeningId, report, childName, riskLevel);
      setTxHash(record.txHash);
    } catch {
      setError("Transaction failed. Please try again.");
    } finally {
      setIsAnchoring(false);
    }
  };

  const displayTx = txHash || existingRecord?.txHash;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30 p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
          <Blocks className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[#1A1A1A]">Blockchain Audit</h3>
          <p className="text-xs text-[#666666]">Tamper-proof clinical record</p>
        </div>
        {(existingRecord || displayTx) && (
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700">Verified</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-xl p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Hash className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Screening Hash</span>
          </div>
          <p className="text-xs font-mono font-bold text-slate-800">
            {shortenHash(hashes.screening, 8)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Shield className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] font-semibold text-slate-500 uppercase">Report Hash</span>
          </div>
          <p className="text-xs font-mono font-bold text-slate-800">
            {shortenHash(hashes.report, 8)}
          </p>
        </div>
      </div>

      {wallet && (
        <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl">
          <Wallet className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-mono text-indigo-700">{shortenHash(wallet.address, 6)}</span>
          <span className="text-[10px] text-indigo-400 ml-auto">{wallet.network}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {displayTx ? (
          <motion.a
            key="confirmed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            href={getPolygonScanUrl(displayTx)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-sky-50 border-2 border-sky-200 rounded-xl cursor-pointer hover:bg-sky-100 transition-colors"
          >
            <Link className="w-4 h-4 text-sky-600" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-sky-700">Transaction Confirmed</p>
              <p className="text-xs font-mono text-sky-800">{shortenHash(displayTx, 12)}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          </motion.a>
        ) : (
          <motion.button
            key="anchor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleAnchor}
            disabled={isAnchoring || isConnecting}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all min-h-[48px] ${
              isAnchoring || isConnecting
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98]"
            }`}
          >
            {isAnchoring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Anchoring on Polygon...</span>
              </>
            ) : isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connecting Web3Auth...</span>
              </>
            ) : wallet ? (
              <span>Anchor On-Chain (~$0.01)</span>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet to Anchor</span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}

      <div className="flex items-center justify-center gap-1.5 pt-1">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-[10px] text-[#999999]">Polygon Mumbai · ~50k gas · $0.01/tx</span>
      </div>
    </motion.div>
  );
}

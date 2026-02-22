import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { TabBar } from "../components/TabBar";
import { useBlockchain } from "../blockchain/BlockchainContext";
import { shortenHash, getPolygonScanUrl, getAddressScanUrl } from "../blockchain/blockchainUtils";
import { motion } from "motion/react";
import {
  ArrowLeft, Blocks, Shield, Wallet, Link, ExternalLink,
  CheckCircle, Clock, Hash, TrendingUp, Loader2, Database,
  AlertTriangle
} from "lucide-react";

const ACTION_LABELS: Record<string, string> = {
  screening_anchored: "Screening Anchored",
  report_verified: "Report Verified",
  data_exported: "Data Exported",
  consent_recorded: "Consent Recorded",
};

const RISK_COLORS: Record<string, string> = {
  on_track: "#34A853",
  monitor: "#FF9800",
  discuss: "#FF5722",
  refer: "#C62828",
};

export function BlockchainAuditScreen() {
  const navigate = useNavigate();
  const { wallet, isConnecting, connectWallet, disconnectWallet, records, auditTrail, stats } = useBlockchain();

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1">
              <ArrowLeft className="w-6 h-6 text-[#1A1A1A]" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">Blockchain Audit</h1>
              <p className="text-sm text-[#666666]">Tamper-proof clinical records</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 p-5 text-white space-y-4"
          >
            <div className="flex items-center gap-3">
              <Blocks className="w-8 h-8" />
              <div>
                <h2 className="text-lg font-bold">Polygon Mumbai</h2>
                <p className="text-sm opacity-80">Web3Auth Non-Custodial Wallet</p>
              </div>
            </div>

            {wallet ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm font-mono">{shortenHash(wallet.address, 8)}</span>
                  <a
                    href={getAddressScanUrl(wallet.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto"
                  >
                    <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/10 rounded-xl p-2 text-center">
                    <div className="text-lg font-bold">{wallet.balance}</div>
                    <div className="text-[10px] opacity-70">MATIC</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2 text-center">
                    <div className="text-lg font-bold">{wallet.chainId}</div>
                    <div className="text-[10px] opacity-70">Chain ID</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2 text-center">
                    <div className="text-lg font-bold">{wallet.provider}</div>
                    <div className="text-[10px] opacity-70">Provider</div>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="w-full py-2 bg-white/20 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full py-3 bg-white text-indigo-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Connect via Web3Auth
                  </>
                )}
              </button>
            )}
          </motion.div>

          <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">On-Chain Statistics</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <Database className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-emerald-700">{stats.totalAnchored}</div>
                <div className="text-[10px] text-[#666666]">Records Anchored</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <Shield className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-blue-700">{stats.integrityScore}%</div>
                <div className="text-[10px] text-[#666666]">Integrity Score</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <TrendingUp className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-amber-700">{stats.totalGasSpent.toLocaleString()}</div>
                <div className="text-[10px] text-[#666666]">Total Gas Used</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <div className="text-xl font-bold text-purple-700">${stats.totalCostUSD.toFixed(3)}</div>
                <div className="text-[10px] text-[#666666]">Total Cost (USD)</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Audit Trail</h2>
            {auditTrail.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center space-y-2">
                <Blocks className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm text-[#666666]">No records anchored yet</p>
                <p className="text-xs text-[#999999]">Complete a screening and anchor it on-chain</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...auditTrail].reverse().map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white border-2 border-gray-100 rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-bold text-[#1A1A1A]">
                          {ACTION_LABELS[entry.action] || entry.action}
                        </span>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: RISK_COLORS[entry.riskLevel] || "#666" }}
                      >
                        {entry.riskLevel.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#666666]">
                      <span className="font-semibold">{entry.childName}</span>
                      <span>·</span>
                      <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                    </div>
                    <a
                      href={getPolygonScanUrl(entry.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700"
                    >
                      <Link className="w-3 h-3" />
                      <span className="font-mono">{shortenHash(entry.txHash, 10)}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border-2 border-gray-100 bg-white p-4 space-y-3">
            <h2 className="text-sm font-bold text-[#999999] uppercase tracking-wider">Recent Transactions</h2>
            {records.length === 0 ? (
              <p className="text-sm text-[#666666] text-center py-3">No transactions yet</p>
            ) : (
              <div className="space-y-2">
                {[...records].reverse().slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className={`w-2 h-2 rounded-full ${
                      record.status === "confirmed" ? "bg-emerald-500" :
                      record.status === "pending" ? "bg-amber-500" : "bg-red-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-[#1A1A1A] truncate">{shortenHash(record.txHash, 10)}</p>
                      <p className="text-[10px] text-[#999999]">
                        Block #{record.blockNumber} · {record.confirmations} confirmations
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#666666]">{record.gasUsed.toLocaleString()} gas</p>
                      <p className="text-[10px] text-emerald-600">${record.gasCostUSD.toFixed(3)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800">Mock Blockchain Mode</p>
              <p className="text-xs text-amber-700 mt-1">
                Transactions are simulated for demonstration. In production, this connects to
                Polygon Mumbai testnet via Web3Auth for real tamper-proof audit trails at ~$0.01/transaction.
              </p>
            </div>
          </div>
        </div>

        <TabBar />
      </div>
    </MobileContainer>
  );
}

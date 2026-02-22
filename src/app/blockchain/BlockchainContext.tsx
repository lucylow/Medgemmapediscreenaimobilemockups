import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { BlockchainWallet, BlockchainRecord, BlockchainStats, AuditTrailEntry } from "./types";
import {
  computeScreeningHash,
  computeReportHash,
  generateMockTxHash,
  generateMockWalletAddress,
  saveRecord,
  loadRecords,
  saveAuditEntry,
  loadAuditTrail,
  computeStats,
} from "./blockchainUtils";

interface BlockchainContextValue {
  wallet: BlockchainWallet | null;
  isConnecting: boolean;
  records: BlockchainRecord[];
  auditTrail: AuditTrailEntry[];
  stats: BlockchainStats;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  anchorScreening: (screeningId: string, report: Record<string, unknown>, childName: string, riskLevel: string) => Promise<BlockchainRecord>;
  verifyScreening: (screeningId: string) => BlockchainRecord | undefined;
}

const BlockchainContext = createContext<BlockchainContextValue | null>(null);

export function BlockchainProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<BlockchainWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [records, setRecords] = useState<BlockchainRecord[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
  const [stats, setStats] = useState<BlockchainStats>({
    totalAnchored: 0,
    totalGasSpent: 0,
    totalCostUSD: 0,
    avgConfirmationTime: 0,
    integrityScore: 0,
    lastAnchorTimestamp: null,
  });

  useEffect(() => {
    setRecords(loadRecords());
    setAuditTrail(loadAuditTrail());
    setStats(computeStats());

    const savedWallet = localStorage.getItem("pediscreen_wallet");
    if (savedWallet) {
      try {
        setWallet(JSON.parse(savedWallet));
      } catch {}
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newWallet: BlockchainWallet = {
      address: generateMockWalletAddress(),
      provider: "web3auth",
      isConnected: true,
      balance: "0.05",
      network: "Polygon Mumbai",
      chainId: 80001,
    };

    setWallet(newWallet);
    localStorage.setItem("pediscreen_wallet", JSON.stringify(newWallet));
    setIsConnecting(false);
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    localStorage.removeItem("pediscreen_wallet");
  }, []);

  const anchorScreening = useCallback(async (
    screeningId: string,
    report: Record<string, unknown>,
    childName: string,
    riskLevel: string
  ): Promise<BlockchainRecord> => {
    if (!wallet) throw new Error("Wallet not connected");

    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));

    const record: BlockchainRecord = {
      id: `br_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      screeningId,
      screeningHash: computeScreeningHash(screeningId),
      reportHash: computeReportHash(report),
      timestamp: Date.now(),
      txHash: generateMockTxHash(),
      blockNumber: 45000000 + Math.floor(Math.random() * 100000),
      network: "polygon_mumbai",
      walletAddress: wallet.address,
      gasUsed: 48000 + Math.floor(Math.random() * 4000),
      gasCostUSD: 0.008 + Math.random() * 0.004,
      status: "confirmed",
      confirmations: 3 + Math.floor(Math.random() * 10),
    };

    saveRecord(record);

    const auditEntry: AuditTrailEntry = {
      id: `ae_${Date.now()}`,
      action: "screening_anchored",
      screeningId,
      childName,
      txHash: record.txHash,
      timestamp: Date.now(),
      riskLevel,
      verified: true,
    };
    saveAuditEntry(auditEntry);

    setRecords(loadRecords());
    setAuditTrail(loadAuditTrail());
    setStats(computeStats());

    return record;
  }, [wallet]);

  const verifyScreening = useCallback((screeningId: string): BlockchainRecord | undefined => {
    return records.find(r => r.screeningId === screeningId && r.status === "confirmed");
  }, [records]);

  return (
    <BlockchainContext.Provider value={{
      wallet,
      isConnecting,
      records,
      auditTrail,
      stats,
      connectWallet,
      disconnectWallet,
      anchorScreening,
      verifyScreening,
    }}>
      {children}
    </BlockchainContext.Provider>
  );
}

export function useBlockchain() {
  const context = useContext(BlockchainContext);
  if (!context) throw new Error("useBlockchain must be used within BlockchainProvider");
  return context;
}

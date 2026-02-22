export interface BlockchainRecord {
  id: string;
  screeningId: string;
  screeningHash: string;
  reportHash: string;
  timestamp: number;
  txHash: string;
  blockNumber: number;
  network: "polygon_mumbai" | "polygon_mainnet";
  walletAddress: string;
  gasUsed: number;
  gasCostUSD: number;
  status: "pending" | "confirmed" | "failed";
  confirmations: number;
}

export interface BlockchainWallet {
  address: string;
  provider: "web3auth" | "metamask" | "walletconnect";
  isConnected: boolean;
  balance: string;
  network: string;
  chainId: number;
}

export interface BlockchainStats {
  totalAnchored: number;
  totalGasSpent: number;
  totalCostUSD: number;
  avgConfirmationTime: number;
  integrityScore: number;
  lastAnchorTimestamp: number | null;
}

export interface AuditTrailEntry {
  id: string;
  action: "screening_anchored" | "report_verified" | "data_exported" | "consent_recorded";
  screeningId: string;
  childName: string;
  txHash: string;
  timestamp: number;
  riskLevel: string;
  verified: boolean;
}

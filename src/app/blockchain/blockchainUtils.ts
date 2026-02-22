import type { BlockchainRecord, AuditTrailEntry, BlockchainStats } from "./types";

function hashString(input: string): string {
  let hash = 0n;
  for (let i = 0; i < input.length; i++) {
    const char = BigInt(input.charCodeAt(i));
    hash = ((hash << 5n) - hash) + char;
    hash = hash & 0xFFFFFFFFFFFFFFFFn;
  }
  const hex = hash.toString(16).padStart(16, '0');
  return '0x' + hex.repeat(4);
}

export function computeScreeningHash(screeningId: string): string {
  return hashString(`screening:${screeningId}:${Date.now()}`);
}

export function computeReportHash(report: Record<string, unknown>): string {
  return hashString(`report:${JSON.stringify(report)}`);
}

export function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * 16)];
  }
  return hash;
}

export function generateMockWalletAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * 16)];
  }
  return addr;
}

export function shortenHash(hash: string, chars: number = 6): string {
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function getPolygonScanUrl(txHash: string): string {
  return `https://mumbai.polygonscan.com/tx/${txHash}`;
}

export function getAddressScanUrl(address: string): string {
  return `https://mumbai.polygonscan.com/address/${address}`;
}

const STORAGE_KEY = "pediscreen_blockchain_records";
const AUDIT_KEY = "pediscreen_audit_trail";

export function loadRecords(): BlockchainRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecord(record: BlockchainRecord): void {
  const records = loadRecords();
  records.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function loadAuditTrail(): AuditTrailEntry[] {
  try {
    const data = localStorage.getItem(AUDIT_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAuditEntry(entry: AuditTrailEntry): void {
  const trail = loadAuditTrail();
  trail.push(entry);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(trail));
}

export function computeStats(): BlockchainStats {
  const records = loadRecords();
  const confirmed = records.filter(r => r.status === "confirmed");
  return {
    totalAnchored: confirmed.length,
    totalGasSpent: confirmed.reduce((sum, r) => sum + r.gasUsed, 0),
    totalCostUSD: confirmed.reduce((sum, r) => sum + r.gasCostUSD, 0),
    avgConfirmationTime: confirmed.length > 0 ? 3.2 : 0,
    integrityScore: confirmed.length > 0 ? 100 : 0,
    lastAnchorTimestamp: confirmed.length > 0 ? Math.max(...confirmed.map(r => r.timestamp)) : null,
  };
}

export function verifyRecordIntegrity(record: BlockchainRecord): boolean {
  return record.status === "confirmed" && record.confirmations >= 3;
}

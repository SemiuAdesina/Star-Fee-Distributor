export type CiStatus = {
  pipeline: string;
  status: "success" | "failed" | "running";
  commit: string;
  runId: string;
  triggeredBy: string;
  timestamp: string;
};

export type CiStatusInput = Omit<CiStatus, "timestamp"> & {
  timestamp?: string;
};

export interface CiStatusService {
  getRecent(limit?: number): Promise<CiStatus[]>;
  getStatus(runId: string): Promise<CiStatus | null>;
  addStatus(payload: CiStatusInput): Promise<void>;
}


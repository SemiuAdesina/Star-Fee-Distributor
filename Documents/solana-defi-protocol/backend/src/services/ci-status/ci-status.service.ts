import { JSONFilePreset } from "lowdb/node";

import type { CiStatusService, CiStatus, CiStatusInput } from "./types.js";

type CiDb = {
  statuses: CiStatus[];
};

export const createCiStatusService = async (): Promise<CiStatusService> => {
  const db = await JSONFilePreset<CiDb>("storage/ci-status.json", { statuses: [] });
  return new LowDbCiStatusService(db);
};

class LowDbCiStatusService implements CiStatusService {
  constructor(private readonly db: Awaited<ReturnType<typeof JSONFilePreset<CiDb>>>) {}

  async getRecent(limit = 10): Promise<CiStatus[]> {
    await this.db.read();
    return this.db.data.statuses.slice(-limit).reverse();
  }

  async getStatus(runId: string): Promise<CiStatus | null> {
    await this.db.read();
    return this.db.data.statuses.find((status) => status.runId === runId) ?? null;
  }

  async addStatus(payload: CiStatusInput): Promise<void> {
    await this.db.read();
    const timestamp = payload.timestamp ?? new Date().toISOString();
    this.db.data.statuses.push({
      ...payload,
      timestamp
    });
    if (this.db.data.statuses.length > 500) {
      this.db.data.statuses.splice(0, this.db.data.statuses.length - 500);
    }
    await this.db.write();
  }
}


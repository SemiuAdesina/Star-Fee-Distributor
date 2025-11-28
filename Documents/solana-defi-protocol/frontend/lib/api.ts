const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";

export type RegistryMetadata = {
  authority: string;
  version: number;
  metadataUri: string | null;
  metadataChecksum: number[] | null;
};

export type CiStatus = {
  pipeline: string;
  status: string;
  commit: string;
  runId: string;
  triggeredBy: string;
  timestamp: string;
};

export const fetchMetadata = async (authority: string): Promise<RegistryMetadata | null> => {
  const res = await fetch(`${backendUrl}/metadata/${authority}`);
  if (!res.ok) {
    return null;
  }
  const data = (await res.json()) as RegistryMetadata;
  return data;
};

export const fetchCiStatuses = async (): Promise<CiStatus[]> => {
  const res = await fetch(`${backendUrl}/ci/status`);
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as CiStatus[];
  return data;
};


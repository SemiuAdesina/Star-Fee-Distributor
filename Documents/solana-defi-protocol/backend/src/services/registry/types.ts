export type RegistryState = {
  authority: string;
  version: number;
  bump: number;
  metadataUri?: string;
  metadataChecksum?: number[];
};

export interface RegistryService {
  getRegistryByAuthority(authority: string): Promise<RegistryState | null>;
}


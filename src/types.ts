export interface TokenEntry {
  address: string;
  symbol: string;
  names: string[];
  decimals: number;
  /** Real blockchain chain ID (the ledger's native chain ID). */
  chainId: string;
  logoURI?: string;
}

export interface ChainInfo {
  /** Real blockchain chain ID. */
  chainId: string;
  chainNames: string[];
}

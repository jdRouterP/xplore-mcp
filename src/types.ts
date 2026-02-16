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
  /**
   * Synthetic deBridge-local ID used to avoid chainId overlaps across
   * different networks. Only present when it differs from chainId.
   * This is the identifier deBridge API calls expect as "chainId".
   */
  debridgeSubscriptionId?: string;
  chainNames: string[];
}

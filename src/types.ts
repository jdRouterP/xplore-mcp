export interface TokenEntry {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  chainId: string;
  logoURI?: string;
}

export interface ChainInfo {
  chainId: string;
  chainNames: string[];
}

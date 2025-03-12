/**
 * Asset data for trading instruments
 * This file contains structured data for assets available in each instrument category
 */

import { instrumentEnum } from "../db/drizzle/schema";

// Define the type for instrument values based on the enum
export type InstrumentValue = (typeof instrumentEnum.enumValues)[number];

export type AssetOption = {
  value: string;
  label: string;
};

export type InstrumentAssets = {
  [key in InstrumentValue]: AssetOption[];
};

/**
 * Forex currency pairs
 * Format: BASE/QUOTE (e.g., EUR/USD)
 */
export const forexPairs: AssetOption[] = [
  {
    value: "EUR/USD",
    label: "EUR/USD",
  },
];

/**
 * Cryptocurrencies
 * Format: SYMBOL (e.g., BTC)
 */
export const cryptoAssets: AssetOption[] = [
  {
    value: "BTC",
    label: "BTC",
  },
];

/**
 * Stocks
 * Format: TICKER (e.g., AAPL)
 */
export const stockAssets: AssetOption[] = [
  {
    value: "AAPL",
    label: "AAPL",
  },
];

/**
 * Combined asset data organized by instrument type
 * Used for dynamic asset selection based on instrument
 */
export const assetsByInstrument: InstrumentAssets = {
  forex: forexPairs,
  crypto: cryptoAssets,
  stocks: stockAssets,
};

/**
 * Get assets for a specific instrument type
 * @param instrument - The instrument type (forex, crypto, stocks)
 * @returns Array of asset options for the specified instrument
 */
export function getAssetsByInstrument(
  instrument: InstrumentValue | string
): AssetOption[] {
  const normalizedInstrument = instrument.toLowerCase() as InstrumentValue;
  return assetsByInstrument[normalizedInstrument] || [];
}

/**
 * Available instrument options for UI display
 */
export const instrumentOptions = instrumentEnum.enumValues.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

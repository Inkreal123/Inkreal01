export type CurrencyCode = "USD" | "EUR" | "GBP" | "ZAR" | "JPY" | "NGN" | "KES" | "GHS" | "EGP" | "CAD" | "MXN" | "BRL" | "AUD" | "INR" | "SGD" | "AED";

export interface Currency { code: CurrencyCode; symbol: string; name: string; decimals: number; rateFromUSD: number; }

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", symbol: "$", name: "US Dollar", decimals: 2, rateFromUSD: 1 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", decimals: 2, rateFromUSD: 0.92 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", decimals: 2, rateFromUSD: 0.79 },
  ZAR: { code: "ZAR", symbol: "R", name: "South African Rand", decimals: 2, rateFromUSD: 18.4 },
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", decimals: 0, rateFromUSD: 149.5 },
  NGN: { code: "NGN", symbol: "₦", name: "Nigerian Naira", decimals: 2, rateFromUSD: 1580 },
  KES: { code: "KES", symbol: "KSh", name: "Kenyan Shilling", decimals: 2, rateFromUSD: 129 },
  GHS: { code: "GHS", symbol: "₵", name: "Ghanaian Cedi", decimals: 2, rateFromUSD: 15.2 },
  EGP: { code: "EGP", symbol: "E£", name: "Egyptian Pound", decimals: 2, rateFromUSD: 48.6 },
  CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", decimals: 2, rateFromUSD: 1.36 },
  MXN: { code: "MXN", symbol: "Mex$", name: "Mexican Peso", decimals: 2, rateFromUSD: 17.1 },
  BRL: { code: "BRL", symbol: "R$", name: "Brazilian Real", decimals: 2, rateFromUSD: 5.04 },
  AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", decimals: 2, rateFromUSD: 1.52 },
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", decimals: 2, rateFromUSD: 83.2 },
  SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", decimals: 2, rateFromUSD: 1.34 },
  AED: { code: "AED", symbol: "AED", name: "UAE Dirham", decimals: 2, rateFromUSD: 3.67 },
};

export function formatPrice(amountUSD: number, currency: CurrencyCode): string {
  const c = CURRENCIES[currency];
  return `${c.symbol}${(amountUSD * c.rateFromUSD).toFixed(c.decimals)}`;
}

export function detectBrowserCurrency(): CurrencyCode {
  const lang = navigator.language || "en-US";
  const region = lang.split("-")[1]?.toUpperCase();
  const map: Record<string, CurrencyCode> = {
    US: "USD", GB: "GBP", ZA: "ZAR", JP: "JPY", NG: "NGN", KE: "KES",
    GH: "GHS", EG: "EGP", CA: "CAD", MX: "MXN", BR: "BRL", AU: "AUD",
    IN: "INR", SG: "SGD", AE: "AED", DE: "EUR", FR: "EUR", ES: "EUR",
  };
  return (region && map[region]) || "USD";
}

export function greetingForHour(hour: number): string {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export function timeOfDayPhase(hour: number): "dawn" | "morning" | "golden" | "evening" | "night" | "midnight" {
  if (hour < 5) return "midnight";
  if (hour < 7) return "dawn";
  if (hour < 11) return "morning";
  if (hour < 16) return "golden";
  if (hour < 19) return "evening";
  if (hour < 22) return "night";
  return "midnight";
}

export function getCurrentSeason(): "spring" | "summer" | "autumn" | "winter" {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export function detectCountry(): string {
  const lang = navigator.language || "en-US";
  const region = lang.split("-")[1]?.toUpperCase();
  if (!region) return "Global";
  const names: Record<string, string> = {
    US: "United States", GB: "United Kingdom", ZA: "South Africa", JP: "Japan",
    NG: "Nigeria", KE: "Kenya", GH: "Ghana", EG: "Egypt", CA: "Canada",
    MX: "Mexico", BR: "Brazil", AU: "Australia", IN: "India", SG: "Singapore",
    AE: "UAE", DE: "Germany", FR: "France", ES: "Spain", IT: "Italy",
  };
  return names[region] || region;
}

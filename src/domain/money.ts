/** Converte texto digitado ("1.234,50", "80", "80,5") em centavos. */
export function parseMoney(input: string): number {
  let s = String(input || "").replace(/[^\d,.]/g, "");
  if (!s) return 0;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : Math.round(n * 100);
}

export const formatMoney = (cents: number): string =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Valor para preencher o input ao editar: 8050 -> "80,50". */
export const centsToInput = (cents: number): string =>
  (cents / 100).toFixed(2).replace(".", ",");

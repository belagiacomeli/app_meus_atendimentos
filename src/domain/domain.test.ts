import { describe, expect, it } from "vitest";
import { addDays, isDayOff, weekStartOf } from "./date";
import { groupByWeek, summaryText, sum, weekEntries } from "./entries";
import { centsToInput, parseMoney } from "./money";
import type { Entry } from "./types";

const e = (id: string, date: string, cents: number): Entry => ({ id, date, client: "Ana", proc: "Escova", cents });

describe("parseMoney", () => {
  it("entende formatos brasileiros", () => {
    expect(parseMoney("80")).toBe(8000);
    expect(parseMoney("80,5")).toBe(8050);
    expect(parseMoney("1.234,50")).toBe(123450);
    expect(parseMoney("1.500")).toBe(150000);
    expect(parseMoney("R$ 45,90")).toBe(4590);
  });
  it("devolve 0 para vazio ou lixo", () => {
    expect(parseMoney("")).toBe(0);
    expect(parseMoney("abc")).toBe(0);
  });
  it("centsToInput é o inverso", () => {
    expect(centsToInput(8050)).toBe("80,50");
  });
});

describe("semana (terça a segunda)", () => {
  it("terça inicia a semana", () => {
    expect(weekStartOf("2026-11-24")).toBe("2026-11-24"); // terça
    expect(weekStartOf("2026-11-28")).toBe("2026-11-24"); // sábado
    expect(weekStartOf("2026-11-30")).toBe("2026-11-24"); // segunda ainda é da semana
    expect(weekStartOf("2026-12-01")).toBe("2026-12-01");
  });
  it("addDays atravessa o mês", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });
  it("domingo e segunda são folga", () => {
    expect(isDayOff("2026-11-29")).toBe(true);
    expect(isDayOff("2026-11-30")).toBe(true);
    expect(isDayOff("2026-11-25")).toBe(false);
  });
});

describe("entries", () => {
  const list = [e("b", "2026-11-25", 5000), e("a", "2026-11-24", 10000), e("c", "2026-12-02", 7000)];

  it("filtra e ordena a semana", () => {
    const w = weekEntries(list, "2026-11-24");
    expect(w.map((x) => x.id)).toEqual(["a", "b"]);
    expect(sum(w)).toBe(15000);
  });
  it("agrupa por semana, mais recente primeiro", () => {
    expect(groupByWeek(list).map((g) => g.weekStart)).toEqual(["2026-12-01", "2026-11-24"]);
  });
  it("monta o resumo", () => {
    const t = summaryText(list, "2026-11-24");
    expect(t).toContain("Semana 24/11 a 28/11");
    expect(t).toContain("TOTAL DA SEMANA");
  });
});

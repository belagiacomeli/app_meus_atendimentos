import { jsPDF } from "jspdf";
import { addDays, dayLabel, formatDM } from "@/domain/date";
import { sum, weekEntries, weekLabel } from "@/domain/entries";
import { formatMoney } from "@/domain/money";
import type { Entry, ISODate } from "@/domain/types";

const ROSE: [number, number, number] = [143, 52, 82];
const MUTED: [number, number, number] = [125, 107, 114];
const L = 18;
const R = 192;

export function buildWeekPdf(entries: Entry[], ws: ISODate, name: string): Blob {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const list = weekEntries(entries, ws);
  let y = 20;

  const needSpace = (h: number) => {
    if (y + h > 280) {
      doc.addPage();
      y = 20;
    }
  };

  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...ROSE);
  doc.text("Atendimentos da semana", L, y);
  y += 7;
  doc.setFont("helvetica", "normal").setFontSize(12).setTextColor(...MUTED);
  doc.text(weekLabel(ws) + (name ? `  |  ${name}` : ""), L, y);
  y += 4;
  doc.setDrawColor(236, 221, 226).line(L, y, R, y);
  y += 8;

  // Terça a sábado sempre aparecem; domingo/segunda só se houve atendimento.
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(ws, i);
    return { date, items: list.filter((e) => e.date === date) };
  }).filter((d, i) => i < 5 || d.items.length);

  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(...MUTED);
  doc.text("CLIENTE", L + 2, y);
  doc.text("PROCEDIMENTO", L + 76, y);
  doc.text("VALOR", R - 2, y, { align: "right" });
  y += 3;

  for (const d of days) {
    needSpace(22);
    y += 4;
    doc.setFillColor(251, 238, 242).rect(L, y - 5, R - L, 8, "F");
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(...ROSE);
    doc.text(dayLabel(d.date), L + 2, y);
    doc.text(d.items.length ? formatMoney(sum(d.items)) : "-", R - 2, y, { align: "right" });
    y += 8;

    if (!d.items.length) {
      doc.setFont("helvetica", "italic").setFontSize(10).setTextColor(...MUTED);
      doc.text("Sem atendimentos", L + 2, y);
      y += 6.5;
    }
    for (const e of d.items) {
      needSpace(8);
      doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(47, 36, 40);
      doc.text(doc.splitTextToSize(e.client, 70)[0], L + 2, y);
      doc.text(doc.splitTextToSize(e.proc, 70)[0], L + 76, y);
      doc.text(formatMoney(e.cents), R - 2, y, { align: "right" });
      y += 6.5;
    }
  }

  needSpace(20);
  y += 4;
  doc.setDrawColor(...ROSE).line(L, y, R, y);
  y += 8;
  doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(...ROSE);
  doc.text("TOTAL DA SEMANA", L + 2, y);
  doc.text(formatMoney(sum(list)), R - 2, y, { align: "right" });

  return doc.output("blob");
}

export const pdfFilename = (ws: ISODate): string =>
  `atendimentos-${formatDM(ws).replace("/", "-")}-a-${formatDM(addDays(ws, 4)).replace("/", "-")}.pdf`;

/** Dispara o download no navegador. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

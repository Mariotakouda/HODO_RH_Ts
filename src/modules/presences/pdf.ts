import { jsPDF } from "jspdf";
import autoTable, { type CellHookData, type HookData } from "jspdf-autotable";
import type { PresenceExportData } from "./service";

const NAVY: [number, number, number] = [15, 23, 42];
const SLATE: [number, number, number] = [100, 116, 139];

const STATUS_LABELS: Record<string, string> = {
  present: "Présent",
  late: "En retard",
  absent: "Absent",
};

function formatDay(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

function formatHours(value: number | null): string {
  return value == null ? "—" : `${value.toFixed(2).replace(".", ",")} h`;
}

function randomToken(length: number): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").slice(0, length).toUpperCase();
}

/** Charge le logo depuis /public ; retourne null s'il est introuvable (le titre texte prend le relais). */
async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch("/images/HODO.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Génère la fiche de présence en PDF : bandeau avec le logo HODO, synthèse, tableau, pied de page
 * numéroté avec référence. Le fichier est protégé : seule l'impression est autorisée
 * (modification, copie et annotation désactivées par un mot de passe propriétaire aléatoire,
 * jamais conservé).
 */
export async function generatePresencePdf(data: PresenceExportData): Promise<string> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
    compress: true,
    encryption: {
      ownerPassword: randomToken(32),
      userPermissions: ["print"],
    },
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;

  const now = new Date(data.generated_at);
  const reference = `HODO-PR-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${randomToken(6)}`;
  const period =
    data.period.from || data.period.to
      ? `Période : ${data.period.from ? `du ${formatDay(data.period.from)}` : "depuis le début"} ${data.period.to ? `au ${formatDay(data.period.to)}` : "à ce jour"}`
      : "Période : toutes les dates";

  // ----- Bandeau d'en-tête (fond sombre : le logo a des lettres blanches) -----
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 30, "F");

  const logo = await loadLogo();
  let titleX = margin;
  if (logo) {
    const logoH = 24;
    const logoW = (logoH * 532) / 469;
    doc.addImage(logo, "PNG", margin, 3, logoW, logoH);
    titleX = margin + logoW + 6;
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("FICHE DE PRÉSENCE", titleX, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("HODO — Système d'information RH", titleX, 22);

  // ----- Informations du document -----
  doc.setTextColor(...NAVY);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(period, margin, 39);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.text(
    `Généré le ${now.toLocaleDateString("fr-FR")} à ${now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} par ${data.generated_by}`,
    margin,
    45
  );
  doc.text(`Référence : ${reference}`, pageW - margin, 39, { align: "right" });

  // ----- Synthèse -----
  const worked = data.rows.filter((r) => r.status !== "absent");
  const stats = [
    ["Pointages", String(data.rows.length)],
    ["Jours présents", String(worked.length)],
    ["Retards", String(data.rows.filter((r) => r.status === "late").length)],
    ["Absences", String(data.rows.filter((r) => r.status === "absent").length)],
    ["Heures totales", formatHours(data.rows.reduce((sum, r) => sum + (r.total_hours ?? 0), 0))],
  ];
  const boxW = (pageW - margin * 2 - 4 * 4) / 5;
  stats.forEach(([label, value], i) => {
    const x = margin + i * (boxW + 4);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, 50, boxW, 16, 2, 2, "F");
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(value, x + 4, 59);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SLATE);
    doc.text(label.toUpperCase(), x + 4, 63.5);
  });

  // ----- Tableau -----
  autoTable(doc, {
    startY: 72,
    margin: { left: margin, right: margin, top: 16, bottom: 16 },
    head: [["Employé", "Département", "Date", "Arrivée", "Sortie", "Heures", "Statut"]],
    body: data.rows.map((r) => [
      r.employee || "—",
      r.department || "—",
      formatDay(r.date),
      r.check_in ?? "—",
      r.check_out ?? "—",
      formatHours(r.total_hours),
      STATUS_LABELS[r.status] ?? r.status,
    ]),
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2.2, textColor: NAVY },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 5: { halign: "right" }, 6: { fontStyle: "bold" } },
    didParseCell: (hook: CellHookData) => {
      if (hook.section === "body" && hook.column.index === 6) {
        const value = String(hook.cell.raw);
        if (value === "En retard") hook.cell.styles.textColor = [180, 83, 9];
        else if (value === "Absent") hook.cell.styles.textColor = [185, 28, 28];
        else hook.cell.styles.textColor = [21, 128, 61];
      }
    },
    didDrawPage: (hook: HookData) => {
      if (hook.pageNumber > 1) {
        doc.setFillColor(...NAVY);
        doc.rect(0, 0, pageW, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("HODO — Fiche de présence", margin, 6.5);
      }
    },
  });

  if (data.truncated) {
    const lastY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 80;
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(9);
    doc.text("Attention : la période contient plus de 5000 lignes, seules les 5000 premières sont affichées.", margin, lastY + 6);
  }

  // ----- Pied de page numéroté -----
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...SLATE);
    doc.text(`Document généré par HODO — protégé contre la modification — Réf. ${reference}`, margin, pageH - 7);
    doc.text(`Page ${i} / ${pages}`, pageW - margin, pageH - 7, { align: "right" });
  }

  // NB : pas de doc.setProperties() — avec le chiffrement, jsPDF écrit des métadonnées illisibles.

  const stamp = now.toISOString().slice(0, 10);
  doc.save(`fiche_presence_${stamp}.pdf`);
  return reference;
}

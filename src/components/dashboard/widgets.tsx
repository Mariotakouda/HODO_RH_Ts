import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import "../../modules/admin/Dashboard.css"; // socle visuel commun (cartes, panneaux, donut, actions)
import "./widgets.css";

/** Carte d'indicateur cliquable (même rendu que le dashboard admin). */
export function StatCard({
  icon,
  label,
  value,
  hint,
  to,
}: {
  icon: string;
  label: string;
  value: ReactNode;
  hint?: string;
  to?: string;
}) {
  const content = (
    <>
      <span className="stat__icon"><i className={`bi ${icon}`} /></span>
      <div className="stat__body">
        <span className="stat__label">{label}</span>
        <span className="stat__value">{value}</span>
        {hint && <span className="stat__hint">{hint}</span>}
      </div>
    </>
  );
  return to ? <Link to={to} className="stat">{content}</Link> : <div className="stat">{content}</div>;
}

export function ActionCard({ to, icon, title, text }: { to: string; icon: string; title: string; text: string }) {
  return (
    <Link to={to} className="action">
      <span className="action__icon"><i className={`bi ${icon}`} /></span>
      <div className="action__body">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
      <i className="bi bi-chevron-right action__chevron" />
    </Link>
  );
}

/** Panneau avec titre, lien « voir tout » facultatif et contenu. */
export function Panel({
  icon,
  title,
  linkTo,
  linkLabel = "Voir tout",
  children,
}: {
  icon: string;
  title: string;
  linkTo?: string;
  linkLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="panel">
      <div className="panel__head">
        <h2><i className={`bi ${icon}`} /> {title}</h2>
        {linkTo && (
          <Link to={linkTo}>
            {linkLabel} <i className="bi bi-arrow-right" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

/** Ligne de liste : titre + sous-titre à gauche, élément libre à droite. */
export function RowItem({ title, sub, right, to }: { title: string; sub?: string; right?: ReactNode; to?: string }) {
  const body = (
    <>
      <div className="rowitem__text">
        <strong>{title}</strong>
        {sub && <span>{sub}</span>}
      </div>
      {right && <div className="rowitem__right">{right}</div>}
    </>
  );
  return to ? <Link to={to} className="rowitem">{body}</Link> : <div className="rowitem">{body}</div>;
}

export function EmptyLine({ text }: { text: string }) {
  return <p className="panel__empty">{text}</p>;
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
  note?: string;
}

const pct = (value: number, total: number) =>
  total > 0 ? `${((value / total) * 100).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %` : "—";

/** Anneau + légende (présences du jour). */
export function DonutChart({ segments, total, centerLabel }: { segments: DonutSegment[]; total: number; centerLabel: string }) {
  const size = 168;
  const stroke = 24;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const arcs = segments
    .filter((s) => s.value > 0 && total > 0)
    .reduce<{ label: string; color: string; length: number; offset: number }[]>((acc, s) => {
      const previous = acc[acc.length - 1];
      acc.push({
        label: s.label,
        color: s.color,
        length: (s.value / total) * circumference,
        offset: previous ? previous.offset + previous.length : 0,
      });
      return acc;
    }, []);

  return (
    <div className="presence">
      <div className="donut" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={centerLabel}>
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef1f6" strokeWidth={stroke} />
            {arcs.map((a) => (
              <circle
                key={a.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={a.color}
                strokeWidth={stroke}
                strokeDasharray={`${a.length} ${circumference - a.length}`}
                strokeDashoffset={-a.offset}
              />
            ))}
          </g>
        </svg>
        <div className="donut__center">
          <strong>{total}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <ul className="legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className="legend__dot" style={{ background: s.color }} />
            <span className="legend__label">
              {s.label}
              {s.note && <small>{s.note}</small>}
            </span>
            <strong>{s.value}</strong>
            <span className="legend__pct">{pct(s.value, total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Barre empilée (répartition des tâches). */
export function StackedBar({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((sum, p) => sum + p.value, 0);
  return (
    <div>
      <div className="stackbar" role="img" aria-label="Répartition des tâches">
        {total === 0 ? (
          <span style={{ width: "100%", background: "#eef1f6" }} />
        ) : (
          parts.filter((p) => p.value > 0).map((p) => (
            <span key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label} : ${p.value}`} />
          ))
        )}
      </div>
      <ul className="legend legend--compact">
        {parts.map((p) => (
          <li key={p.label}>
            <span className="legend__dot" style={{ background: p.color }} />
            <span className="legend__label">{p.label}</span>
            <strong>{p.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
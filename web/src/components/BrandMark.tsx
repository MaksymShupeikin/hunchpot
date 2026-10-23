import s from "./brand.module.css";

/** The pot mark and wordmark from /brand, with the lid in white for the dark app. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`${s.brand} ${className}`}>
      <svg viewBox="28 36 200 192" aria-hidden="true">
        <path fill="var(--text)" d="M28 62A18 18 0 0 1 46 44H210A18 18 0 0 1 228 62A18 18 0 0 1 210 80H46A18 18 0 0 1 28 62Z" />
        <path fill="var(--o0-br)" d="M137 96H52A12 12 0 0 0 40 108V160A64 64 0 0 0 104 224H115C91 170 163 146 137 96Z" />
        <path fill="var(--o1-br)" d="M155 96C181 146 109 170 133 224H152A64 64 0 0 0 216 160V108A12 12 0 0 0 204 96Z" />
      </svg>
      Hunchpot
    </span>
  );
}

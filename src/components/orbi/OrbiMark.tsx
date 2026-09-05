export function OrbiMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* planeta */}
      <circle cx="20" cy="20" r="8.5" stroke="currentColor" strokeWidth="1.2" opacity="0.9" />
      {/* meridiano — sugere globo */}
      <ellipse cx="20" cy="20" rx="3.6" ry="8.5" stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
      {/* paralelo */}
      <path d="M11.9 17.2h16.2M11.9 22.8h16.2" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
      {/* órbita principal */}
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="7"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
        transform="rotate(-28 20 20)"
      />
      {/* órbita secundária */}
      <ellipse
        cx="20"
        cy="20"
        rx="13.5"
        ry="5"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.22"
        transform="rotate(34 20 20)"
      />
      {/* satélite */}
      <circle cx="33" cy="12.5" r="2" fill="currentColor" />
      <circle cx="33" cy="12.5" r="4" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
    </svg>
  );
}

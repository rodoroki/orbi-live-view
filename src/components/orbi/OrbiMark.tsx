export function OrbiMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="20" r="8.5" stroke="currentColor" strokeWidth="1.2" opacity="0.9" />
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="7"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.45"
        transform="rotate(-28 20 20)"
      />
      <circle cx="33" cy="12.5" r="2" fill="currentColor" />
    </svg>
  );
}
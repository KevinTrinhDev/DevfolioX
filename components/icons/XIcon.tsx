// components/icons/XIcon.tsx
// Filled X / Twitter glyph (lucide doesn't ship a clean modern X icon).
export function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M18.9 2H22l-6.8 7.78L22.9 22H17l-4.6-6.1L6.9 22H3.8l7.3-8.38L1.2 2H7.3l4.2 5.6L18.9 2Zm-1.1 18h1.7L6.4 3.9H4.6L17.8 20Z"
      />
    </svg>
  );
}

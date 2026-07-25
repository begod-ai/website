/**
 * Renders an external link only when its configured URL is non-empty.
 * Prevents dead "#" links anywhere in the interface.
 */
export function ExternalLinkItem({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  );
}

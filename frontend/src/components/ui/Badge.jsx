function Badge({
  children,
  variante = "neutral",
  className = "",
}) {
  return (
    <span
      className={`ui-badge ui-badge-${variante} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
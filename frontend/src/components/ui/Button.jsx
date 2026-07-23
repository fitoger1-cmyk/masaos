function Button({
  children,
  variante = "primary",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`ui-button ui-button-${variante} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
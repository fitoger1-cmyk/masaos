function Card({
  children,
  className = "",
  as: Component = "section",
}) {
  return (
    <Component className={`ui-card ${className}`}>
      {children}
    </Component>
  );
}

export default Card;
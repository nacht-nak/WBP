export function SectionHeading({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <div className="eyebrow">
          <span className="section-number">{number}</span>{" "}
          {title === "Selected projects"
            ? "THINGS I’VE BUILT"
            : title.toUpperCase()}
        </div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {children}
    </div>
  );
}

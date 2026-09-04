export default function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 card-header">
      <div className="min-w-0">
        <h2 className="card-title">{title}</h2>
        {description && <p className="card-description">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
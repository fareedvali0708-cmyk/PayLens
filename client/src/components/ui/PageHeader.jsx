export default function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="flex items-start justify-between gap-6 w-full">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </header>
  )
}
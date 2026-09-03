export default function MetricCard({ label, value, icon, detail, className = '' }) {
  return (
    <div className={`bg-surface border border-border rounded-xl px-5 py-5 animate-fade-in ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-text-muted text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="text-text-muted">{icon}</span>
        )}
      </div>
      <div className="font-heading text-2xl font-bold text-text leading-none mb-1">
        {value}
      </div>
      {detail && (
        <p className="text-xs text-text-muted mt-2">{detail}</p>
      )}
    </div>
  )
}

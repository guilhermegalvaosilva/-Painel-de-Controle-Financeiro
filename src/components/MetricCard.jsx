import { compactBrl } from '../utils/formatters'

export function MetricCard({ label, value, detail, tone = 'default', format = 'money' }) {
  const displayValue = typeof value === 'number' && format === 'money' ? compactBrl.format(value) : value

  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span>{label}</span>
      <strong>{displayValue}</strong>
      <small>{detail}</small>
    </article>
  )
}

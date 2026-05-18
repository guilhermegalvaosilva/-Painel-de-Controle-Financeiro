import { compactBrl } from '../utils/formatters'
import { CardHelpButton } from './CardHelpButton'

export function MetricCard({ label, value, detail, info, tone = 'default', format = 'money' }) {
  const displayValue = typeof value === 'number' && format === 'money' ? compactBrl.format(value) : value

  return (
    <article className={`metric-card metric-card--${tone}`}>
      {info ? (
        <CardHelpButton title={label} description={info} detail={detail} value={displayValue} />
      ) : null}
      <span>{label}</span>
      <strong>{displayValue}</strong>
      <small>{detail}</small>
    </article>
  )
}

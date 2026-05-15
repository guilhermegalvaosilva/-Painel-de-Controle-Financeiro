import { compactBrl } from '../utils/formatters'

export function BarList({ title, subtitle, items, valueType = 'money', limit = 7 }) {
  const visible = items.slice(0, limit)
  const max = Math.max(...visible.map((item) => Math.abs(item.value)), 1)

  return (
    <section className="panel chart-panel">
      <div className="panel-title">
        <div className="title-dot" />
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="ranking-chart">
        {visible.map((item) => (
          <div className="ranking-row" key={item.label}>
            <span>{item.label}</span>
            <div className="ranking-track">
              <i style={{ width: `${(Math.abs(item.value) / max) * 100}%` }} />
            </div>
            <strong>{valueType === 'money' ? compactBrl.format(item.value) : item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

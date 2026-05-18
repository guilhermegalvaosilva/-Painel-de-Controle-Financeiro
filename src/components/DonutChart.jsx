import { compactBrl } from '../utils/formatters'
import { CardHelpButton } from './CardHelpButton'

const colors = ['#0f766e', '#d97706', '#2563eb', '#9f1239', '#5b21b6', '#475569']

export function DonutChart({ title, subtitle, items, info }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const slices = items.map((item, index) => {
    const previous = items.slice(0, index).reduce((sum, slice) => sum + slice.value, 0)
    const dash = (item.value / total) * 100

    return {
      ...item,
      dash,
      offset: 25 - (previous / total) * 100,
    }
  })

  return (
    <section className="panel chart-panel panel--donut">
      <CardHelpButton
        title={title}
        description={info || 'Gráfico de participação usado para mostrar como o valor se distribui entre os grupos da base.'}
        detail={subtitle || 'As fatias representam a proporção de cada grupo.'}
        value={`${items.length} grupos`}
      />
      <div className="panel-title">
        <div className="title-dot" />
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="donut-layout">
        <svg className="donut" viewBox="0 0 42 42" role="img" aria-label={title}>
          <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#e6e8df" strokeWidth="5" />
          {slices.map((item, index) => (
              <circle
                key={item.label}
                cx="21"
                cy="21"
                r="15.9"
                fill="transparent"
                stroke={colors[index % colors.length]}
                strokeDasharray={`${item.dash} ${100 - item.dash}`}
                strokeDashoffset={item.offset}
                strokeWidth="5"
              />
          ))}
          <text x="21" y="20" textAnchor="middle">
            {items.length}
          </text>
          <text x="21" y="25" textAnchor="middle" className="donut__caption">
            grupos
          </text>
        </svg>
        <div className="legend-list">
          {items.map((item, index) => (
            <div className="legend-item" key={item.label}>
              <i style={{ background: colors[index % colors.length] }} />
              <span>{item.label}</span>
              <strong>{compactBrl.format(item.value)}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

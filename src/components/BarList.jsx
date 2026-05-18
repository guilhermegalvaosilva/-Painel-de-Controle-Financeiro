import { useState } from 'react'
import { compactBrl } from '../utils/formatters'
import { CardHelpButton } from './CardHelpButton'

export function BarList({ title, subtitle, items, valueType = 'money', limit = 7, info, expandable = false }) {
  const [expanded, setExpanded] = useState(false)
  const visible = items.slice(0, expanded ? items.length : limit)
  const max = Math.max(...visible.map((item) => Math.abs(item.value)), 1)
  const canExpand = expandable && items.length > limit

  return (
    <section className="panel chart-panel">
      <CardHelpButton
        title={title}
        description={info || 'Gráfico de barras usado para comparar rapidamente os maiores itens do recorte selecionado.'}
        detail={subtitle || `${visible.length} itens exibidos`}
        value={`${visible.length} de ${items.length} itens`}
      />
      <div className="panel-title">
        <div className="title-dot" />
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {canExpand ? (
          <button className="panel-action-button" type="button" onClick={() => setExpanded((current) => !current)}>
            {expanded ? 'Ver menos' : 'Ver mais'}
          </button>
        ) : null}
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

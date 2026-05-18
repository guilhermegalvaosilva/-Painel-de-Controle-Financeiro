import { compactBrl } from '../utils/formatters'
import { CardHelpButton } from './CardHelpButton'

const palette = ['#d54b3f', '#f0a31a', '#4dd4cf', '#514fe0', '#b542d6']

export function ColumnChart({ title, subtitle, groups, info }) {
  const rubrics = ['Realizado', 'Comprometido', 'Saldo']
  const max = Math.max(...groups.flatMap((group) => group.values), 1)

  return (
    <section className="panel chart-panel chart-panel--wide">
      <CardHelpButton
        title={title}
        description={info || 'Gráfico comparativo para enxergar realizado, comprometido e saldo lado a lado por grupo.'}
        detail={subtitle || 'Cada cor representa uma rubrica financeira.'}
        value={`${groups.length} grupos exibidos`}
      />
      <div className="panel-title">
        <div className="title-dot" />
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      <div className="chart-legend">
        {rubrics.map((rubric, index) => (
          <span key={rubric}>
            <i style={{ background: palette[index] }} />
            {rubric}
          </span>
        ))}
      </div>
      <div className="column-chart">
        {groups.map((group) => (
          <div className="column-group" key={group.label}>
            <div className="columns">
              {group.values.map((value, index) => (
                <div
                  key={`${group.label}-${rubrics[index]}`}
                  className="column-bar"
                  title={`${rubrics[index]}: ${compactBrl.format(value)}`}
                  style={{
                    height: `${Math.max((value / max) * 100, value > 0 ? 4 : 0)}%`,
                    background: palette[index],
                  }}
                >
                  <b className="col-value">{compactBrl.format(value)}</b>
                </div>
              ))}
            </div>
            <small className="group-label" title={group.label}>{group.label}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

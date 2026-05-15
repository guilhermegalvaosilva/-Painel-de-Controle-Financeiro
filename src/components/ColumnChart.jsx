import { compactBrl } from '../utils/formatters'

const palette = ['#d54b3f', '#f0a31a', '#4dd4cf', '#514fe0', '#b542d6']

export function ColumnChart({ title, subtitle, groups }) {
  const rubrics = ['Realizado', 'Comprometido', 'Saldo']
  const max = Math.max(...groups.flatMap((group) => group.values), 1)

  return (
    <section className="panel chart-panel chart-panel--wide">
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
                <span
                  key={`${group.label}-${rubrics[index]}`}
                  title={`${rubrics[index]}: ${compactBrl.format(value)}`}
                  style={{
                    height: `${Math.max((value / max) * 100, value > 0 ? 3 : 0)}%`,
                    background: palette[index],
                  }}
                />
              ))}
            </div>
            <small>{group.label}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

import { compactBrl } from '../utils/formatters'
import { CardHelpButton } from './CardHelpButton'

const colors = ['#2EA6A1', '#124986', '#77C6CC', '#5F7A8D', '#8DA0B4', '#BDCFD5', '#1E7F76']
const shareFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
})

function formatOptionalMoney(value) {
  return typeof value === 'number' ? compactBrl.format(value) : '-'
}

export function DonutChart({ title, subtitle, items, info, detailTitle, valueType = 'money' }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const safeTotal = total || 1
  const isCountChart = valueType === 'count'
  const isDetailChart = Boolean(detailTitle)
  const slices = items.map((item, index) => {
    const previous = items.slice(0, index).reduce((sum, slice) => sum + slice.value, 0)
    const dash = (item.value / safeTotal) * 100
    const offset = 25 - (previous / safeTotal) * 100
    const shareLabel = `${shareFormatter.format(dash)}%`
    const valueLabel = isCountChart ? item.value : compactBrl.format(item.value)
    const realizedLabel = formatOptionalMoney(item.detailValue)
    const committedLabel = formatOptionalMoney(item.committedValue)
    const balanceLabel = formatOptionalMoney(item.balanceValue)
    const tooltipParts = [
      item.label,
      isCountChart ? `${valueLabel} (${shareLabel})` : `Contratado: ${valueLabel}`,
      typeof item.detailValue === 'number' ? `${item.detailLabel || 'Realizado'}: ${realizedLabel}` : null,
      typeof item.committedValue === 'number' ? `Comprometido: ${committedLabel}` : null,
      typeof item.balanceValue === 'number' ? `Saldo: ${balanceLabel}` : null,
      item.count ? `${item.count} projeto${item.count > 1 ? 's' : ''}` : null,
      isCountChart ? null : shareLabel,
    ].filter(Boolean)

    return {
      ...item,
      balanceLabel,
      color: item.color || colors[index % colors.length],
      committedLabel,
      dash,
      offset,
      realizedLabel,
      shareLabel,
      tooltip: tooltipParts.join(' | '),
      valueLabel,
    }
  })
  const hasFinancialBreakdown = slices.some(
    (item) =>
      typeof item.detailValue === 'number' ||
      typeof item.committedValue === 'number' ||
      typeof item.balanceValue === 'number' ||
      item.count,
  )

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
      <div className={isDetailChart ? 'donut-layout donut-layout--detail' : 'donut-layout'}>
        <svg className="donut" viewBox="0 0 42 42" role="img" aria-label={title}>
          <circle className="donut__track" cx="21" cy="21" r="15.9" />
          {slices.map((item) => (
            <circle
              className="donut__slice"
              cx="21"
              cy="21"
              fill="transparent"
              key={item.label}
              r="15.9"
              stroke={item.color}
              strokeDasharray={`${item.dash} ${100 - item.dash}`}
              strokeDashoffset={item.offset}
            >
              <title>{item.tooltip}</title>
            </circle>
          ))}
          <text className="donut__count" x="21" y="20" textAnchor="middle">
            {items.length}
          </text>
          <text className="donut__caption" x="21" y="25" textAnchor="middle">
            grupos
          </text>
        </svg>
        {isDetailChart ? (
          <div className="donut-detail">
            <h3>{detailTitle}</h3>
            {slices.map((item) => (
              <div className="donut-detail__row has-tooltip" data-tooltip={item.tooltip} key={item.label} tabIndex={0}>
                <i style={{ background: item.color }} />
                <span>{item.label}</span>
                <strong>
                  {item.valueLabel} ({item.shareLabel})
                </strong>
              </div>
            ))}
          </div>
        ) : (
          <div className="legend-list">
            {slices.map((item) => (
              <div className="legend-item has-tooltip" data-tooltip={item.tooltip} key={item.label} tabIndex={0}>
                <i style={{ background: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
        {!isDetailChart && hasFinancialBreakdown ? (
          <div className="donut-breakdown">
            <div className="donut-breakdown__row donut-breakdown__head">
              <span>Grupo</span>
              <span>Contratado</span>
              <span>Realizado</span>
              <span>Comprom.</span>
              <span>Saldo</span>
              <span>Proj.</span>
            </div>
            {slices.map((item) => (
              <div className="donut-breakdown__row" key={`${item.label}-breakdown`}>
                <span className="donut-breakdown__label">
                  <i style={{ background: item.color }} />
                  {item.label}
                </span>
                <strong>{item.valueLabel}</strong>
                <strong>{item.realizedLabel}</strong>
                <strong>{item.committedLabel}</strong>
                <strong>{item.balanceLabel}</strong>
                <strong>{item.count || '-'}</strong>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

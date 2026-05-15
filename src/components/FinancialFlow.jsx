import { compactBrl, percent } from '../utils/formatters'

export function FinancialFlow({ total, released, receivable, realized, committed, balance }) {
  const rows = [
    { label: 'Instrumento contratual', value: total, tone: 'base' },
    { label: 'Recurso liberado', value: released, tone: 'good' },
    { label: 'Recurso a receber', value: receivable, tone: 'wait' },
    { label: 'Total realizado', value: realized, tone: 'done' },
    { label: 'Comprometido', value: committed, tone: 'risk' },
    { label: 'Saldo atual', value: balance, tone: balance < 0 ? 'alert' : 'cash' },
  ]
  const max = Math.max(...rows.map((row) => Math.abs(row.value)), 1)

  return (
    <section className="panel flow-panel">
      <div className="panel__heading">
        <div>
          <h2>Fluxo financeiro</h2>
          <p>Leitura consolidada entre contratado, liberado, realizado e saldo.</p>
        </div>
        <strong>{percent.format(realized / total)} executado</strong>
      </div>
      <div className="flow-stack">
        {rows.map((row) => (
          <div className={`flow-row flow-row--${row.tone}`} key={row.label}>
            <span>{row.label}</span>
            <div>
              <i style={{ width: `${(Math.abs(row.value) / max) * 100}%` }} />
            </div>
            <strong>{compactBrl.format(row.value)}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

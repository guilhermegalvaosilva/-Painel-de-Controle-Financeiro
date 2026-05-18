import { useMemo, useState } from "react";
import { BarList } from "./components/BarList";
import { ColumnChart } from "./components/ColumnChart";
import { DonutChart } from "./components/DonutChart";
import { FinancialFlow } from "./components/FinancialFlow";
import { MetricCard } from "./components/MetricCard";
import { ProjectTable } from "./components/ProjectTable";
import { projects } from "./data/projects";
import {
  brl,
  groupByCount,
  groupBySum,
  lifecycleStatus,
  percent,
  sumBy,
} from "./utils/formatters";
import "./styles/dashboard.css";

const allOption = "Todos";
const supportOptions = [allOption, "Sim", "Não"];

const optionList = (values) => [
  allOption,
  ...new Set(
    values
      .filter(Boolean)
      .map((value) => String(value).trim())
      .sort((a, b) => a.localeCompare(b, "pt-BR")),
  ),
];

const projectOptions = [allOption, ...projects.map((project) => project.id)];
const modalityOptions = optionList(
  projects.map((project) => project.instrumentType),
);
const areaOptions = optionList(projects.map((project) => project.unit));
const funderOptions = optionList(projects.map((project) => project.funder));
const natureOptions = optionList(projects.map((project) => project.nature));
const axisOptions = optionList(projects.map((project) => project.axis));
const instrumentOptions = optionList(
  projects.map((project) => project.instrumentNumber),
);

function App() {
  const [filters, setFilters] = useState({
    project: allOption,
    modality: allOption,
    area: allOption,
    funder: allOption,
    nature: allOption,
    axis: allOption,
    supportTed: allOption,
    instrumentNumber: allOption,
    start: "",
    end: "",
  });

  const updateFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesProject =
          filters.project === allOption || project.id === filters.project;
        const matchesModality =
          filters.modality === allOption ||
          project.instrumentType === filters.modality;
        const matchesArea =
          filters.area === allOption || project.unit === filters.area;
        const matchesFunder =
          filters.funder === allOption || project.funder === filters.funder;
        const matchesNature =
          filters.nature === allOption || project.nature === filters.nature;
        const matchesAxis =
          filters.axis === allOption || project.axis === filters.axis;
        const matchesSupport =
          filters.supportTed === allOption ||
          (filters.supportTed === "Sim") === project.supportTed;
        const matchesInstrument =
          filters.instrumentNumber === allOption ||
          project.instrumentNumber === filters.instrumentNumber;
        const matchesStart = !filters.start || project.start >= filters.start;
        const matchesEnd = !filters.end || project.end <= filters.end;

        return (
          matchesProject &&
          matchesModality &&
          matchesArea &&
          matchesFunder &&
          matchesNature &&
          matchesAxis &&
          matchesSupport &&
          matchesInstrument &&
          matchesStart &&
          matchesEnd
        );
      }),
    [filters],
  );

  const totals = useMemo(
    () => {
      const today = new Date();
      const supportTedCount = filteredProjects.filter(
        (project) => project.supportTed,
      ).length;
      const negativeBalance = filteredProjects.filter(
        (project) => project.currentBalance < 0,
      ).length;
      const closed = filteredProjects.filter(
        (project) => new Date(`${project.end}T12:00:00`) < today,
      ).length;

      return {
        projects: filteredProjects.length,
        total: sumBy(filteredProjects, "total"),
        budgetBalance: sumBy(filteredProjects, "budgetBalance"),
        released: sumBy(filteredProjects, "released"),
        receivable: sumBy(filteredProjects, "receivable"),
        realized: sumBy(filteredProjects, "realized"),
        committed: sumBy(filteredProjects, "committed"),
        balance: sumBy(filteredProjects, "currentBalance"),
        earnings: sumBy(filteredProjects, "earnings"),
        supportTedCount,
        negativeBalance,
        closed,
      };
    },
    [filteredProjects],
  );

  const executionRate = totals.total ? totals.realized / totals.total : 0;
  const releasedRate = totals.total ? totals.released / totals.total : 0;
  const availableCash = totals.released - totals.realized - totals.committed;

  const topRealizedProjects = useMemo(
    () =>
      [...filteredProjects]
        .sort((a, b) => b.realized - a.realized)
        .slice(0, 10)
        .map((project) => ({ label: project.id, value: project.realized })),
    [filteredProjects],
  );

  const topTotalProjects = useMemo(
    () =>
      [...filteredProjects]
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map((project) => ({ label: project.id, value: project.total })),
    [filteredProjects],
  );

  const instrumentItems = useMemo(
    () => groupBySum(filteredProjects, "instrumentType", "total").slice(0, 6),
    [filteredProjects],
  );

  const natureItems = useMemo(
    () => groupBySum(filteredProjects, "nature", "total").slice(0, 6),
    [filteredProjects],
  );

  const funderItems = useMemo(
    () => groupBySum(filteredProjects, "funder", "total").slice(0, 8),
    [filteredProjects],
  );

  const axisItems = useMemo(
    () => groupBySum(filteredProjects, "axis", "total").slice(0, 6),
    [filteredProjects],
  );

  const coordinationGroups = useMemo(
    () =>
      groupBySum(filteredProjects, "unit", "realized")
        .slice(0, 10)
        .map((item) => {
          const areaProjects = filteredProjects.filter(
            (project) => project.unit === item.label,
          );

          return {
            label: item.label,
            values: [
              sumBy(areaProjects, "realized"),
              sumBy(areaProjects, "committed"),
              Math.max(sumBy(areaProjects, "currentBalance"), 0),
            ],
          };
        }),
    [filteredProjects],
  );

  const statusItems = useMemo(
    () =>
      groupByCount(
        filteredProjects.map((project) => ({
          ...project,
          status: lifecycleStatus(project).label,
        })),
        "status",
      ),
    [filteredProjects],
  );

  const endYearItems = useMemo(() => {
    const grouped = new Map();

    filteredProjects.forEach((project) => {
      const year = project.end ? project.end.slice(0, 4) : "Sem data";
      grouped.set(year, (grouped.get(year) || 0) + 1);
    });

    return [...grouped.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => String(a.label).localeCompare(String(b.label), "pt-BR"));
  }, [filteredProjects]);

  const balanceRanking = [...filteredProjects]
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 5);

  const portfolioStats = [
    {
      label: "Projetos filtrados",
      value: totals.projects,
      detail: `de ${projects.length} na base`,
    },
    {
      label: "Coordenações",
      value: new Set(filteredProjects.map((project) => project.unit)).size,
      detail: "campo Coordenação",
    },
    {
      label: "Financiadores",
      value: new Set(filteredProjects.map((project) => project.funder)).size,
      detail: "campo Ente Financiador",
    },
    {
      label: "Instrumentos",
      value: new Set(filteredProjects.map((project) => project.instrumentType))
        .size,
      detail: "tipos contratuais",
    },
    {
      label: "TED de suporte",
      value: totals.supportTedCount,
      detail: `${percent.format(totals.projects ? totals.supportTedCount / totals.projects : 0)} da seleção`,
    },
    {
      label: "Saldo negativo",
      value: totals.negativeBalance,
      detail: "projetos em atenção",
      tone: totals.negativeBalance ? "danger" : "success",
    },
  ];

  const resetFilters = () =>
    setFilters({
      project: allOption,
      modality: allOption,
      area: allOption,
      funder: allOption,
      nature: allOption,
      axis: allOption,
      supportTed: allOption,
      instrumentNumber: allOption,
      start: "",
      end: "",
    });

  return (
    <main className="finance-dashboard">
      <header className="topbar">
        <div className="brandline">
          <span className="brand-icon" />
          <div>
            <h1>Painel de Projetos GEREB</h1>
            <p>Fiocruz Brasília | Base Excel de 2025</p>
          </div>
        </div>
        <div className="source-badge">
          <span>{projects.length} projetos</span>
          <strong>23 campos da planilha</strong>
        </div>
      </header>

      <section className="filter-panel" aria-label="Filtros da base GEREB">
        <FilterSelect
          label="Projeto"
          value={filters.project}
          onChange={(value) => updateFilter("project", value)}
          options={projectOptions}
        />
        <FilterSelect
          label="Instrumento"
          value={filters.modality}
          onChange={(value) => updateFilter("modality", value)}
          options={modalityOptions}
        />
        <FilterSelect
          label="Coordenação"
          value={filters.area}
          onChange={(value) => updateFilter("area", value)}
          options={areaOptions}
        />
        <FilterSelect
          label="Ente financiador"
          value={filters.funder}
          onChange={(value) => updateFilter("funder", value)}
          options={funderOptions}
        />
        <FilterSelect
          label="Natureza"
          value={filters.nature}
          onChange={(value) => updateFilter("nature", value)}
          options={natureOptions}
        />
        <FilterSelect
          label="Eixo estratégico"
          value={filters.axis}
          onChange={(value) => updateFilter("axis", value)}
          options={axisOptions}
        />
        <FilterSelect
          label="Nº instrumento"
          value={filters.instrumentNumber}
          onChange={(value) => updateFilter("instrumentNumber", value)}
          options={instrumentOptions}
        />
        <FilterSelect
          label="TED suporte"
          value={filters.supportTed}
          onChange={(value) => updateFilter("supportTed", value)}
          options={supportOptions}
        />
        <label className="filter-control">
          <span>Início vigência</span>
          <input
            type="date"
            value={filters.start}
            onChange={(event) => updateFilter("start", event.target.value)}
          />
        </label>
        <label className="filter-control">
          <span>Fim vigência</span>
          <input
            type="date"
            value={filters.end}
            onChange={(event) => updateFilter("end", event.target.value)}
          />
        </label>
        <div className="filter-actions">
          <button type="button">Aplicar</button>
          <button type="button" onClick={resetFilters}>
            Limpar
          </button>
        </div>
      </section>

      <section className="portfolio-band" aria-label="Resumo da carteira">
        {portfolioStats.map((stat) => (
          <article
            className={stat.tone ? `portfolio-stat portfolio-stat--${stat.tone}` : "portfolio-stat"}
            key={stat.label}
          >
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </article>
        ))}
      </section>

      <section className="kpi-row kpi-row--financial">
        <MetricCard
          label="Valor total dos instrumentos"
          value={totals.total}
          detail="Soma contratual"
          tone="blue"
        />
        <MetricCard
          label="Saldo orçamentário atual"
          value={totals.budgetBalance}
          detail="Campo da planilha"
          tone="teal"
        />
        <MetricCard
          label="Recurso liberado"
          value={totals.released}
          detail={`${percent.format(releasedRate)} do contratado`}
          tone="green"
        />
        <MetricCard
          label="Recurso a receber"
          value={totals.receivable}
          detail="Previsão ainda não liberada"
          tone="amber"
        />
        <MetricCard
          label="Total realizado"
          value={totals.realized}
          detail={`${percent.format(executionRate)} executado`}
          tone="violet"
        />
        <MetricCard
          label="Total comprometido"
          value={totals.committed}
          detail="Compromissos registrados"
          tone="red"
        />
        <MetricCard
          label="Saldo total atual"
          value={totals.balance}
          detail={`${brl.format(availableCash)} caixa livre`}
          tone={totals.balance < 0 ? "red" : "green"}
        />
        <MetricCard
          label="Rendimentos"
          value={totals.earnings}
          detail="Acumulado da carteira"
          tone={totals.earnings < 0 ? "red" : "blue"}
        />
      </section>

      <section className="dashboard-grid">
        <FinancialFlow
          total={totals.total}
          released={totals.released}
          receivable={totals.receivable}
          realized={totals.realized}
          committed={totals.committed}
          balance={totals.balance}
        />
        <DonutChart
          title="Carteira por Tipo de Instrumento"
          subtitle="Valor total do instrumento contratual"
          items={
            instrumentItems.length
              ? instrumentItems
              : [{ label: "Sem dados", value: 1 }]
          }
        />
      </section>

      <ColumnChart
        title="Realizado, Comprometido e Saldo por Coordenação"
        subtitle="Concentração financeira das coordenações com maior execução"
        groups={coordinationGroups}
      />

      <section className="charts-row">
        <BarList
          title="Projetos por Total Realizado"
          subtitle="Ranking de execução financeira"
          items={topRealizedProjects}
          limit={10}
        />
        <BarList
          title="Projetos por Valor Contratado"
          subtitle="Ranking do valor total do instrumento"
          items={topTotalProjects}
          limit={10}
        />
      </section>

      <section className="dashboard-grid dashboard-grid--support">
        <BarList
          title="Ente Financiador"
          subtitle="Valor total contratado por financiador"
          items={funderItems}
          limit={8}
        />
        <DonutChart
          title="Naturezas dos Projetos"
          subtitle="Valor total contratado por natureza"
          items={
            natureItems.length ? natureItems : [{ label: "Sem dados", value: 1 }]
          }
        />
      </section>

      <section className="dashboard-grid dashboard-grid--support">
        <BarList
          title="Eixo Mapa Estratégico Fiocruz"
          subtitle="Valor total contratado por eixo"
          items={axisItems}
          limit={6}
        />
        <StatusPanel statusItems={statusItems} endYearItems={endYearItems} />
      </section>

      <ProjectTable projects={filteredProjects} />

      <section className="ranking-strip">
        <h2>
          Ranking de projetos com maior saldo disponível{" "}
          <span>(Saldo total atual)</span>
        </h2>
        <div>
          {balanceRanking.map((project, index) => (
            <article key={project.id}>
              <strong>{index + 1}</strong>
              <span>{project.id}</span>
              <b>{brl.format(project.currentBalance)}</b>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function StatusPanel({ statusItems, endYearItems }) {
  const maxStatus = Math.max(...statusItems.map((item) => item.value), 1);
  const maxYear = Math.max(...endYearItems.map((item) => item.value), 1);

  return (
    <section className="panel status-panel">
      <div className="panel-title">
        <div className="title-dot" />
        <div>
          <h2>Vigência e Situação</h2>
          <p>Status calculado pela data final de vigência</p>
        </div>
      </div>
      <div className="status-grid">
        <div className="status-list">
          {statusItems.map((item) => (
            <div className="status-meter" key={item.label}>
              <span>{item.label}</span>
              <div>
                <i style={{ width: `${(item.value / maxStatus) * 100}%` }} />
              </div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <div className="year-list">
          {endYearItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <i style={{ height: `${Math.max((item.value / maxYear) * 100, 6)}%` }} />
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="filter-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export default App;

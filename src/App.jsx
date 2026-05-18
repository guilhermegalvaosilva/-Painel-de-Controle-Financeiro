import { useMemo, useState } from "react";
import { BarList } from "./components/BarList";
import { CardHelpButton } from "./components/CardHelpButton";
import { ColumnChart } from "./components/ColumnChart";
import { DonutChart } from "./components/DonutChart";
import { FinancialFlow } from "./components/FinancialFlow";
import { MetricCard } from "./components/MetricCard";
import { ProjectTable } from "./components/ProjectTable";
import fiocruzLogo from "./assets/fiocruz-50anos.png";
import { projects } from "./data/projects";
import {
  brl,
  groupBySum,
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
  const [activePage, setActivePage] = useState("dashboard");
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

  const balanceRanking = [...filteredProjects]
    .sort((a, b) => b.currentBalance - a.currentBalance)
    .slice(0, 5);

  const earningsProjects = useMemo(
    () =>
      [...filteredProjects]
        .sort((a, b) => b.earnings - a.earnings)
        .map((project) => ({ label: project.id, value: project.earnings })),
    [filteredProjects],
  );

  const earningsByCoordination = useMemo(
    () => groupBySum(filteredProjects, "unit", "earnings").slice(0, 10),
    [filteredProjects],
  );

  const earningsByFunder = useMemo(
    () => groupBySum(filteredProjects, "funder", "earnings").slice(0, 8),
    [filteredProjects],
  );

  const positiveEarningsCount = filteredProjects.filter(
    (project) => project.earnings > 0,
  ).length;
  const topEarningProject = earningsProjects[0];

  const portfolioStats = [
    {
      label: "Projetos filtrados",
      value: totals.projects,
      detail: `de ${projects.length} na base`,
      info: "Linhas da planilha que entram no recorte atual.",
    },
    {
      label: "Coordenações",
      value: new Set(filteredProjects.map((project) => project.unit)).size,
      detail: "campo Coordenação",
      info: "Conta as áreas responsáveis diferentes.",
    },
    {
      label: "Financiadores",
      value: new Set(filteredProjects.map((project) => project.funder)).size,
      detail: "campo Ente Financiador",
      info: "Mostra quantos entes financiam os projetos filtrados.",
    },
    {
      label: "Instrumentos",
      value: new Set(filteredProjects.map((project) => project.instrumentType))
        .size,
      detail: "tipos contratuais",
      info: "Conta as modalidades contratuais da seleção.",
    },
    {
      label: "TED de suporte",
      value: totals.supportTedCount,
      detail: `${percent.format(totals.projects ? totals.supportTedCount / totals.projects : 0)} da seleção`,
      info: "Projetos marcados como Sim em TED de Suporte.",
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
          <img className="brand-logo" src={fiocruzLogo} alt="Fiocruz Brasília" />
          <div>
            <h1>Painel de Projetos GEREB</h1>
            <p>Base Excel de 2026</p>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            type="button"
            className={activePage === "dashboard" ? "nav-button is-active" : "nav-button"}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={activePage === "earnings" ? "nav-button is-active" : "nav-button"}
            onClick={() => setActivePage("earnings")}
          >
            Rendimentos
          </button>
          <div className="source-badge">
            <span>{projects.length} projetos</span>
            <strong>23 campos da planilha</strong>
          </div>
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

      {activePage === "dashboard" ? (
        <>
      <section className="portfolio-band" aria-label="Resumo da carteira">
        {portfolioStats.map((stat) => (
          <article
            className={stat.tone ? `portfolio-stat portfolio-stat--${stat.tone}` : "portfolio-stat"}
            key={stat.label}
          >
            <CardHelpButton
              title={stat.label}
              description={stat.info}
              detail={stat.detail}
              value={stat.value}
            />
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
          info="Soma da coluna Valor Total Instrumento Contratual."
          detail="Soma contratual"
          tone="blue"
        />
        <MetricCard
          label="Saldo orçamentário atual"
          value={totals.budgetBalance}
          info="Soma da coluna Saldo Orçamentário Atual."
          detail="Campo da planilha"
          tone="teal"
        />
        <MetricCard
          label="Recurso liberado"
          value={totals.released}
          info="Total que já foi disponibilizado para os projetos."
          detail={`${percent.format(releasedRate)} do contratado`}
          tone="green"
        />
        <MetricCard
          label="Recurso a receber"
          value={totals.receivable}
          info="Valor previsto que ainda não foi liberado."
          detail="Previsão ainda não liberada"
          tone="amber"
        />
        <MetricCard
          label="Total realizado"
          value={totals.realized}
          info="Soma executada ou gasta pelos projetos."
          detail={`${percent.format(executionRate)} executado`}
          tone="violet"
        />
        <MetricCard
          label="Total comprometido"
          value={totals.committed}
          info="Compromissos registrados, ainda não necessariamente pagos."
          detail="Compromissos registrados"
          tone="red"
        />
        <MetricCard
          label="Saldo total atual"
          value={totals.balance}
          info="Saldo financeiro atual informado na base."
          detail={`${brl.format(availableCash)} caixa livre`}
          tone={totals.balance < 0 ? "red" : "green"}
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
          info="Mostra por qual tipo de instrumento contratual o valor total da carteira está concentrado. Ajuda a identificar a dependência da carteira em TED, convênios, emendas e outros formatos."
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
        info="Compara as coordenações com maior execução para mostrar onde estão concentrados os valores realizados, os compromissos assumidos e os saldos disponíveis."
        groups={coordinationGroups}
      />

      <section className="charts-row">
        <BarList
          title="Projetos por Total Realizado"
          subtitle="Ranking de execução financeira"
          info="Lista os projetos com maior total realizado. Serve para identificar quais projetos mais executaram recursos dentro do filtro selecionado."
          items={topRealizedProjects}
          limit={10}
          expandable
        />
        <BarList
          title="Projetos por Valor Contratado"
          subtitle="Ranking do valor total do instrumento"
          info="Lista os maiores projetos pelo valor total contratado. Ajuda a separar porte contratual de execução financeira."
          items={topTotalProjects}
          limit={10}
        />
      </section>

      <section className="dashboard-grid dashboard-grid--support">
        <BarList
          title="Ente Financiador"
          subtitle="Valor total contratado por financiador"
          info="Mostra quais entes financiadores concentram o maior valor contratado na carteira filtrada."
          items={funderItems}
          limit={8}
        />
        <DonutChart
          title="Naturezas dos Projetos"
          subtitle="Valor total contratado por natureza"
          info="Mostra como o valor contratado se divide por natureza do projeto, como ensino, pesquisa, extensão e desenvolvimento institucional."
          items={
            natureItems.length ? natureItems : [{ label: "Sem dados", value: 1 }]
          }
        />
      </section>

      <section className="dashboard-grid dashboard-grid--support dashboard-grid--single">
        <BarList
          title="Eixo Mapa Estratégico Fiocruz"
          subtitle="Valor total contratado por eixo"
          info="Organiza o valor contratado pelos eixos estratégicos informados na planilha, ajudando a ver quais temas concentram mais recursos."
          items={axisItems}
          limit={6}
        />
      </section>

      <ProjectTable projects={filteredProjects} />

      <section className="ranking-strip">
        <h2>
          Ranking de projetos com maior saldo disponível
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
        </>
      ) : (
        <EarningsPage
          totals={totals}
          projects={filteredProjects}
          topProject={topEarningProject}
          positiveCount={positiveEarningsCount}
          earningsProjects={earningsProjects}
          earningsByCoordination={earningsByCoordination}
          earningsByFunder={earningsByFunder}
        />
      )}
    </main>
  );
}

function EarningsPage({
  totals,
  projects,
  topProject,
  positiveCount,
  earningsProjects,
  earningsByCoordination,
  earningsByFunder,
}) {
  return (
    <section className="earnings-page" aria-label="Página de rendimentos">
      <div className="page-heading">
        <div>
          <h2>Rendimentos</h2>
          <p>Leitura específica da coluna Rendimentos para os projetos filtrados.</p>
        </div>
        <span>{projects.length} projetos no recorte</span>
      </div>

      <section className="kpi-row kpi-row--financial">
        <MetricCard
          label="Rendimentos totais"
          value={totals.earnings}
          info="Soma da coluna Rendimentos para todos os projetos do filtro atual."
          detail="Acumulado do recorte"
          tone={totals.earnings < 0 ? "red" : "blue"}
        />
        <MetricCard
          label="Projetos com rendimento"
          value={positiveCount}
          info="Quantidade de projetos com valor positivo na coluna Rendimentos."
          detail={`${percent.format(projects.length ? positiveCount / projects.length : 0)} da seleção`}
          tone="green"
          format="plain"
        />
        <MetricCard
          label="Maior rendimento"
          value={topProject?.value || 0}
          info="Projeto com maior valor de rendimento dentro dos filtros aplicados."
          detail={topProject?.label || "Sem projeto"}
          tone="amber"
        />
      </section>

      <section className="charts-row">
        <BarList
          title="Projetos por Rendimentos"
          subtitle="Ranking da coluna Rendimentos"
          info="Mostra todos os projetos ordenados pelo valor de rendimentos. Use Ver mais para expandir a lista completa do recorte."
          items={earningsProjects}
          limit={12}
          expandable
        />
        <BarList
          title="Rendimentos por Coordenação"
          subtitle="Soma de rendimentos por coordenação"
          info="Agrupa os rendimentos por coordenação para identificar onde os rendimentos estão mais concentrados."
          items={earningsByCoordination}
          limit={10}
        />
      </section>

      <BarList
        title="Rendimentos por Ente Financiador"
        subtitle="Soma de rendimentos por financiador"
        info="Agrupa os rendimentos por ente financiador, ajudando a identificar a origem institucional dos maiores rendimentos."
        items={earningsByFunder}
        limit={8}
      />
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

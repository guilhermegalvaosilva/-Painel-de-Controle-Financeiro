import { useMemo, useState } from "react";
import { BarList } from "./components/BarList";
import { ColumnChart } from "./components/ColumnChart";
import { DonutChart } from "./components/DonutChart";
import { MetricCard } from "./components/MetricCard";
import { ProjectTable } from "./components/ProjectTable";
import { projects } from "./data/projects";
import { brl, groupBySum, sumBy } from "./utils/formatters";
import "./styles/dashboard.css";

const allOption = "Todos";
const projectOptions = [allOption, ...projects.map((project) => project.id)];
const modalityOptions = [
  allOption,
  ...new Set(projects.map((project) => project.instrumentType)),
];
const areaOptions = [
  allOption,
  ...new Set(projects.map((project) => project.unit)),
];
const funderOptions = [
  allOption,
  ...new Set(projects.map((project) => project.funder)),
];

function App() {
  const [filters, setFilters] = useState({
    project: allOption,
    modality: allOption,
    area: allOption,
    funder: allOption,
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
        const matchesStart = !filters.start || project.start >= filters.start;
        const matchesEnd = !filters.end || project.end <= filters.end;

        return (
          matchesProject &&
          matchesModality &&
          matchesArea &&
          matchesFunder &&
          matchesStart &&
          matchesEnd
        );
      }),
    [filters],
  );

  const totals = useMemo(
    () => ({
      total: sumBy(filteredProjects, "total"),
      released: sumBy(filteredProjects, "released"),
      receivable: sumBy(filteredProjects, "receivable"),
      realized: sumBy(filteredProjects, "realized"),
      committed: sumBy(filteredProjects, "committed"),
      balance: sumBy(filteredProjects, "currentBalance"),
      closed: filteredProjects.filter((project) => project.currentBalance <= 0)
        .length,
    }),
    [filteredProjects],
  );

  const topProjects = useMemo(
    () =>
      [...filteredProjects]
        .sort((a, b) => b.realized - a.realized)
        .slice(0, 11)
        .map((project) => ({ label: project.id, value: project.realized })),
    [filteredProjects],
  );

  const donutItems = useMemo(
    () =>
      groupBySum(filteredProjects, "instrumentType", "realized").slice(0, 6),
    [filteredProjects],
  );

  const columnGroups = useMemo(
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

  const resetFilters = () =>
    setFilters({
      project: allOption,
      modality: allOption,
      area: allOption,
      funder: allOption,
      start: "",
      end: "",
    });

  return (
    <main className="finance-dashboard">
      <header className="topbar">
        <div className="brandline">
          <span className="brand-icon" />
          <div>
            <h1>Painel de Controle Financeiro</h1>
            <p>Fiocruz Brasília | Execução de Gastos DI 2026</p>
          </div>
        </div>
      </header>

      <section className="filter-panel" aria-label="Filtros financeiros">
        <FilterSelect
          label="Projeto"
          value={filters.project}
          onChange={(value) => updateFilter("project", value)}
          options={projectOptions}
        />
        <FilterSelect
          label="Modalidade"
          value={filters.modality}
          onChange={(value) => updateFilter("modality", value)}
          options={modalityOptions}
        />
        <FilterSelect
          label="Área demandante"
          value={filters.area}
          onChange={(value) => updateFilter("area", value)}
          options={areaOptions}
        />
        <FilterSelect
          label="Favorecido"
          value={filters.funder}
          onChange={(value) => updateFilter("funder", value)}
          options={funderOptions}
        />
        <label className="filter-control">
          <span>Data inicial</span>
          <input
            type="date"
            value={filters.start}
            onChange={(event) => updateFilter("start", event.target.value)}
          />
        </label>
        <label className="filter-control">
          <span>Data final</span>
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

      <section className="kpi-row">
        <MetricCard
          label="Total gasto 2026"
          value={totals.realized}
          detail="Soma realizada no recorte"
          tone="teal"
        />
        <MetricCard
          label="Projeto com maior gasto"
          value={topProjects[0]?.label || "-"}
          detail={brl.format(topProjects[0]?.value || 0)}
          tone="amber"
        />
        <MetricCard
          label="Saldo total dos projetos"
          value={totals.balance}
          detail="Caixa disponível agregado"
          tone={totals.balance < 0 ? "red" : "blue"}
        />
        <MetricCard
          label="Saldo total geral disponível"
          value={totals.released - totals.realized - totals.committed}
          detail={brl.format(totals.released)}
          tone="green"
        />
        <MetricCard
          label="Projetos encerrados"
          value={totals.closed}
          detail={`${filteredProjects.length} projetos no filtro`}
          tone="violet"
          format="plain"
        />
      </section>

      <section className="charts-row">
        <BarList
          title="Ranking de Projetos (Por concentração de recursos executados - DI)"
          items={topProjects}
          limit={11}
        />
        <DonutChart
          title="Utilização por Tipo de Gasto"
          items={
            donutItems.length ? donutItems : [{ label: "Sem dados", value: 1 }]
          }
        />
      </section>

      <ColumnChart
        title="Concentração de Gastos por Área Demandante e Rubrica"
        groups={columnGroups}
      />

      <ProjectTable projects={filteredProjects} />

      <section className="ranking-strip">
        <h2>
          Ranking projetos com maior saldo DI disponível{" "}
          <span>(Caixa Geral Fiotec)</span>
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

      <section className="detail-panel">
        <div className="panel-title">
          <div className="title-dot" />
          <h2>Detalhes do Projeto</h2>
        </div>
        <div className="detail-grid">
          <FilterSelect
            label="ID recebido projeto"
            value={filters.project}
            onChange={(value) => updateFilter("project", value)}
            options={projectOptions}
          />
          <FilterSelect
            label="Número do instrumento"
            value={allOption}
            onChange={() => {}}
            options={[
              allOption,
              ...new Set(projects.map((project) => project.instrumentNumber)),
            ]}
          />
        </div>
      </section>
    </main>
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

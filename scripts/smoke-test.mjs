import { readFile } from 'node:fs/promises'
import { projects } from '../src/data/projects.js'

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
const cssSource = await readFile(new URL('../src/styles/dashboard.css', import.meta.url), 'utf8')

const instrumentCount = projects.filter((project) => project.instrumentType !== 'EMENDAS').length

assert(projects.length >= 127, 'A base deve conter pelo menos 127 projetos.')
assert(instrumentCount === 127, 'O total exibido em Tipos de Instrumentos deve ser 127 projetos.')
assert(appSource.includes('ResourceDistribution'), 'O painel deve renderizar a distribuição de recursos.')
assert(appSource.includes('filter-shell'), 'Os filtros compactos devem estar presentes.')
assert(cssSource.includes('project-card-list'), 'A visualização mobile em cards deve estar estilizada.')

console.log('Smoke test passed.')

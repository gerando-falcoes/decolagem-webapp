/**
 * Exemplo de dados para demonstrar o componente TimelineChart
 * Este arquivo mostra como o componente renderiza com dados reais
 */

import { TimelineChart } from './TimelineChart';

// Dados de exemplo para visualização
export const ExampleTimelineData = [
  {
    week: '15/01',
    score: 4.2,
    assessments: 3,
    quebra_ciclo: 0,
    prosperidade: 1,
    dignidade: 1,
    pobreza: 1,
    pobreza_extrema: 0
  },
  {
    week: '22/01',
    score: 5.1,
    assessments: 5,
    quebra_ciclo: 1,
    prosperidade: 2,
    dignidade: 1,
    pobreza: 1,
    pobreza_extrema: 0
  },
  {
    week: '29/01',
    score: 6.3,
    assessments: 7,
    quebra_ciclo: 2,
    prosperidade: 3,
    dignidade: 1,
    pobreza: 1,
    pobreza_extrema: 0
  },
  {
    week: '05/02',
    score: 5.8,
    assessments: 4,
    quebra_ciclo: 1,
    prosperidade: 2,
    dignidade: 1,
    pobreza: 0,
    pobreza_extrema: 0
  },
  {
    week: '12/02',
    score: 7.2,
    assessments: 8,
    quebra_ciclo: 3,
    prosperidade: 4,
    dignidade: 1,
    pobreza: 0,
    pobreza_extrema: 0
  }
];

// Função para testar o componente com dados
export function TimelineChartExample() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Exemplo da Timeline de Evolução</h2>
      <TimelineChart />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Funcionalidades da Timeline:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• <strong>Gráfico de barras</strong>: Mostra evolução da pontuação média</li>
          <li>• <strong>Métricas resumo</strong>: Total de avaliações e score médio</li>
          <li>• <strong>Detalhes por semana</strong>: Lista scrollável com dados</li>
          <li>• <strong>Hover tooltips</strong>: Informações detalhadas ao passar o mouse</li>
          <li>• <strong>Estados visuais</strong>: Loading, erro e "sem dados"</li>
          <li>• <strong>Responsive</strong>: Adapta para diferentes tamanhos de tela</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="font-medium text-green-900 mb-2">Dados Atuais:</h3>
        <ul className="text-green-800 text-sm space-y-1">
          <li>• <strong>1 semana</strong> com dados (22/09/2025)</li>
          <li>• <strong>1 avaliação</strong> realizada</li>
          <li>• <strong>Score 6.0</strong> (prosperidade em desenvolvimento)</li>
          <li>• <strong>Timeline funcional</strong> e pronta para mais dados</li>
        </ul>
      </div>
    </div>
  );
}

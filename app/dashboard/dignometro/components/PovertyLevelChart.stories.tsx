/**
 * Exemplo de dados para demonstrar o componente PovertyLevelChart
 * Este arquivo mostra como o componente renderiza com dados reais
 */

import { PovertyLevelChart } from './PovertyLevelChart';

// Dados de exemplo para visualização
export const ExamplePovertyLevelData = [
  {
    name: 'pobreza extrema',
    value: 5,
    color: '#DC2626'
  },
  {
    name: 'pobreza',
    value: 8,
    color: '#EA580C'
  },
  {
    name: 'dignidade',
    value: 15,
    color: '#EAB308'
  },
  {
    name: 'prosperidade em desenvolvimento',
    value: 12,
    color: '#16A34A'
  },
  {
    name: 'quebra de ciclo da pobreza',
    value: 7,
    color: '#059669'
  }
];

// Função para testar o componente com dados
export function PovertyLevelChartExample() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Exemplo do Gráfico de Níveis de Pobreza</h2>
      <PovertyLevelChart />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Como funciona:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Quando não há dados: Mostra "Nenhum dado disponível"</li>
          <li>• Com dados: Exibe gráfico de barras com percentuais</li>
          <li>• Cores definidas em constants/colors.ts</li>
          <li>• Dados vêm da view dignometro_dashboard</li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Exemplo de dados para demonstrar o componente DimensionChart
 * Este arquivo mostra como o componente renderiza com dados reais
 */

import { DimensionChart } from './DimensionChart';

// Dados de exemplo para visualização
export const ExampleDimensionData = [
  {
    dimension: 'alimentacao',
    percentage: 25,
    positive_count: 5,
    total_count: 20,
    color: '#DC2626'
  },
  {
    dimension: 'agua',
    percentage: 35,
    positive_count: 7,
    total_count: 20,
    color: '#DC2626'
  },
  {
    dimension: 'educacao',
    percentage: 45,
    positive_count: 9,
    total_count: 20,
    color: '#EAB308'
  },
  {
    dimension: 'renda_estavel',
    percentage: 60,
    positive_count: 12,
    total_count: 20,
    color: '#EAB308'
  },
  {
    dimension: 'saneamento',
    percentage: 75,
    positive_count: 15,
    total_count: 20,
    color: '#16A34A'
  },
  {
    dimension: 'moradia',
    percentage: 80,
    positive_count: 16,
    total_count: 20,
    color: '#16A34A'
  },
  {
    dimension: 'saude',
    percentage: 85,
    positive_count: 17,
    total_count: 20,
    color: '#16A34A'
  },
  {
    dimension: 'poupanca',
    percentage: 90,
    positive_count: 18,
    total_count: 20,
    color: '#16A34A'
  }
];

// Função para testar o componente com dados
export function DimensionChartExample() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Exemplo do Gráfico de Dimensões</h2>
      <DimensionChart />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Funcionalidades do Gráfico de Dimensões:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• <strong>Análise de JSONB</strong>: Processa o campo answers das avaliações</li>
          <li>• <strong>Fallback inteligente</strong>: Se RPC falhar, processa no cliente</li>
          <li>• <strong>Cores dinâmicas</strong>: Verde (≥70%), Amarelo (40-69%), Vermelho (&lt;40%)</li>
          <li>• <strong>Ícones informativos</strong>: CheckCircle, Target, XCircle</li>
          <li>• <strong>Estatísticas resumo</strong>: Excelentes, Médias, Críticas</li>
          <li>• <strong>Barras de progresso</strong>: Representação visual do percentual</li>
          <li>• <strong>Hover effects</strong>: Interações visuais suaves</li>
        </ul>
      </div>

      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="font-medium text-green-900 mb-2">Dados Atuais (1 avaliação):</h3>
        <div className="grid grid-cols-2 gap-4 text-green-800 text-sm">
          <div>
            <p><strong>Dimensões 100%:</strong></p>
            <ul className="ml-4 list-disc">
              <li>Saneamento</li>
              <li>Renda Diversificada</li>
              <li>Poupança</li>
              <li>Bens e Conectividade</li>
              <li>Moradia</li>
              <li>Saúde</li>
            </ul>
          </div>
          <div>
            <p><strong>Dimensões 0%:</strong></p>
            <ul className="ml-4 list-disc">
              <li>Alimentação</li>
              <li>Água</li>
              <li>Renda Estável</li>
              <li>Educação</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

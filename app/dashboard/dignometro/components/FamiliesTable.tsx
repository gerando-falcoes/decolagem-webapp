"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFamiliesTableData, FamilyTableData } from '../hooks/useFamiliesTableData';
import { useFamilyDetails } from '../hooks/useFamilyDetails';
import { FamilySearchBar } from './FamilySearchBar';
import { Loader2, AlertTriangle, Users, MapPin, Calendar, TrendingUp, Eye, Target, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Componente para mostrar detalhes da família
function FamilyDetailsModal({ familyId, familyName }: { familyId: string; familyName: string }) {
  const { data: details, isLoading, error } = useFamilyDetails(familyId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Carregando detalhes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
        <span className="text-red-600">Erro ao carregar detalhes</span>
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="space-y-6">
      {/* Dados Básicos */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Users size={18} />
          Dados Básicos
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Localização</p>
            <p className="font-medium">{details.family.city}, {details.family.state}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Mentor</p>
            <p className="font-medium">{details.family.mentor_email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Composição</p>
            <p className="font-medium">{details.family.family_size} pessoas ({details.family.children_count} crianças)</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Renda</p>
            <p className="font-medium">{details.family.income_range}</p>
          </div>
        </div>
      </div>

      {/* Avaliações */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={18} />
          Avaliações ({details.assessments.length})
        </h3>
        {details.assessments.length > 0 ? (
          <div className="space-y-2">
            {details.assessments.slice(0, 3).map((assessment, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Score: {assessment.poverty_score}/10</p>
                    <p className="text-sm text-gray-600">{assessment.poverty_level}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(assessment.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma avaliação encontrada</p>
        )}
      </div>

      {/* Membros */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <UserCheck size={18} />
          Membros da Família ({details.members.length})
        </h3>
        {details.members.length > 0 ? (
          <div className="space-y-2">
            {details.members.map((member, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{member.nome}</p>
                <p className="text-sm text-gray-600">
                  {member.relacao_familia} • {member.idade} anos
                  {member.is_responsavel && <span className="ml-2 text-blue-600">(Responsável)</span>}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum membro cadastrado</p>
        )}
      </div>

      {/* Metas */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Target size={18} />
          Metas Atribuídas ({details.goals.length})
        </h3>
        {details.goals.length > 0 ? (
          <div className="space-y-2">
            {details.goals.map((goal, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{goal.goal_templates?.goal_name}</p>
                <p className="text-sm text-gray-600">{goal.goal_templates?.dimension}</p>
                <p className="text-sm text-gray-500">Status: {goal.current_status}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma meta atribuída</p>
        )}
      </div>
    </div>
  );
}

export function FamiliesTable() {
  const { data: familiesData, isLoading, error } = useFamiliesTableData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAssessment, setFilterAssessment] = useState('all');
  const [filterScore, setFilterScore] = useState('all');
  const [filterChildren, setFilterChildren] = useState('all');
  const [filterIncome, setFilterIncome] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users size={18} />
            Informações das Famílias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-gray-500">Carregando dados das famílias...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users size={18} />
            Informações das Famílias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600">Erro ao carregar dados das famílias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No data state
  if (!familiesData || familiesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users size={18} />
            Informações das Famílias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhuma família encontrada</p>
              <p className="text-gray-400 text-sm">Não há famílias cadastradas no sistema</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Função para obter cor baseada no nível de pobreza
  const getPovertyLevelColor = (level: string | null) => {
    switch (level) {
      case 'quebra de ciclo da pobreza': return 'text-green-600 bg-green-50';
      case 'prosperidade em desenvolvimento': return 'text-green-600 bg-green-50';
      case 'dignidade': return 'text-yellow-600 bg-yellow-50';
      case 'pobreza': return 'text-orange-600 bg-orange-50';
      case 'pobreza extrema': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Função para obter cor baseada no status de aprovação
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'text-green-600 bg-green-50';
      case 'pendente': return 'text-yellow-600 bg-yellow-50';
      case 'rejeitado': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Função para obter cor baseada na pontuação
  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-500';
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    if (score >= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  // Filtrar dados
  const filteredData = familiesData.filter(family => {
    // Se há uma família selecionada via pesquisa, mostrar apenas ela
    if (selectedFamilyId) {
      return family.family_id === selectedFamilyId;
    }
    
    // Caso contrário, aplicar filtros normais
    const matchesSearch = family.family_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         family.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         family.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (family.mentor_email && family.mentor_email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || family.status_aprovacao === filterStatus;
    
    // Filtro por avaliação
    const matchesAssessment = filterAssessment === 'all' || 
      (filterAssessment === 'avaliada' && family.poverty_score !== null) ||
      (filterAssessment === 'nao-avaliada' && family.poverty_score === null);
    
    // Filtro por score
    let matchesScore = true;
    if (filterScore !== 'all' && family.poverty_score !== null) {
      const score = family.poverty_score;
      switch (filterScore) {
        case 'excellent':
          matchesScore = score >= 7.0;
          break;
        case 'good':
          matchesScore = score >= 5.0 && score < 7.0;
          break;
        case 'regular':
          matchesScore = score >= 3.0 && score < 5.0;
          break;
        case 'critical':
          matchesScore = score < 3.0;
          break;
      }
    } else if (filterScore !== 'all' && family.poverty_score === null) {
      matchesScore = false;
    }
    
    // Filtro por crianças
    const matchesChildren = filterChildren === 'all' ||
      (filterChildren === 'with-children' && family.children_count > 0) ||
      (filterChildren === 'no-children' && family.children_count === 0);
    
    // Filtro por renda
    let matchesIncome = true;
    if (filterIncome !== 'all') {
      const income = family.income_range?.toLowerCase() || '';
      switch (filterIncome) {
        case 'ate-1sm':
          matchesIncome = income.includes('ate-1sm') || income.includes('ate_1_sm');
          break;
        case '1-2sm':
          matchesIncome = income.includes('1-2sm');
          break;
        case '2-3sm':
          matchesIncome = income.includes('2-3sm');
          break;
        case 'acima-3sm':
          matchesIncome = income.includes('r$') && !income.includes('1-2sm') && !income.includes('2-3sm') && !income.includes('ate');
          break;
        case 'nao-informado':
          matchesIncome = !family.income_range || family.income_range === 'N/A';
          break;
      }
    }
    
    // Filtro por nível de pobreza
    let matchesLevel = true;
    if (filterLevel !== 'all') {
      const level = family.poverty_level?.toLowerCase() || '';
      switch (filterLevel) {
        case 'prosperidade':
          matchesLevel = level.includes('prosperidade');
          break;
        case 'quebra-ciclo':
          matchesLevel = level.includes('quebra') || level.includes('ciclo');
          break;
        case 'dignidade':
          matchesLevel = level.includes('dignidade');
          break;
        case 'pobreza':
          matchesLevel = level.includes('pobreza') && !level.includes('extrema');
          break;
        case 'pobreza-extrema':
          matchesLevel = level.includes('pobreza extrema');
          break;
        case 'nao-avaliado':
          matchesLevel = !family.poverty_level;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesAssessment && matchesScore && matchesChildren && matchesIncome && matchesLevel;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users size={16} />
          Informações das Famílias
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Filtros */}
          <div className="space-y-3">
            {/* Barra de pesquisa avançada */}
            <FamilySearchBar
              onFamilySelect={(familyId) => setSelectedFamilyId(familyId)}
              className="w-full"
            />
            
            {/* Filtros rápidos por dimensões */}
            <div className="space-y-2">
              {/* Primeira linha de filtros */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">📋 Todos os status</option>
                  <option value="aprovado">✅ Aprovado</option>
                  <option value="pendente">⏳ Pendente</option>
                  <option value="rejeitado">❌ Rejeitado</option>
                </select>
                
                <select
                  value={filterAssessment}
                  onChange={(e) => setFilterAssessment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">🎯 Todas avaliações</option>
                  <option value="avaliada">📊 Avaliada</option>
                  <option value="nao-avaliada">📋 Não avaliada</option>
                </select>
                
                <select
                  value={filterScore}
                  onChange={(e) => setFilterScore(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">⭐ Todos os scores</option>
                  <option value="excellent">🟢 Excelente (≥7.0)</option>
                  <option value="good">🟡 Bom (5.0-6.9)</option>
                  <option value="regular">🟠 Regular (3.0-4.9)</option>
                  <option value="critical">🔴 Crítico (&lt;3.0)</option>
                </select>
                
                <select
                  value={filterChildren}
                  onChange={(e) => setFilterChildren(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">👶 Todas famílias</option>
                  <option value="with-children">🧒 Com crianças</option>
                  <option value="no-children">👥 Sem crianças</option>
                </select>
              </div>

              {/* Segunda linha de filtros */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={filterIncome}
                  onChange={(e) => setFilterIncome(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">💰 Todas as rendas</option>
                  <option value="ate-1sm">💵 Até 1 SM</option>
                  <option value="1-2sm">💰 1-2 SM</option>
                  <option value="2-3sm">💎 2-3 SM</option>
                  <option value="acima-3sm">🏆 Acima 3 SM</option>
                  <option value="nao-informado">❓ Não informado</option>
                </select>
                
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">📊 Todos os níveis</option>
                  <option value="prosperidade">🌟 Prosperidade</option>
                  <option value="quebra-ciclo">📈 Quebra de Ciclo</option>
                  <option value="dignidade">⚖️ Dignidade</option>
                  <option value="pobreza">⚠️ Pobreza</option>
                  <option value="pobreza-extrema">🚨 Pobreza Extrema</option>
                  <option value="nao-avaliado">❓ Não avaliado</option>
                </select>
                
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterAssessment('all');
                    setFilterScore('all');
                    setFilterChildren('all');
                    setFilterIncome('all');
                    setFilterLevel('all');
                    setSelectedFamilyId(null);
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                >
                  🔄 Limpar filtros
                </button>
              </div>
            </div>

            {/* Família selecionada via pesquisa */}
            {selectedFamilyId && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Família selecionada: {familiesData?.find(f => f.family_id === selectedFamilyId)?.family_name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFamilyId(null)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Limpar seleção
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 py-2 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm font-bold text-blue-600">
                {familiesData.length}
              </p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-green-600">
                {familiesData.filter(f => f.status_aprovacao === 'aprovado').length}
              </p>
              <p className="text-xs text-gray-600">Aprovadas</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-yellow-600">
                {familiesData.filter(f => f.poverty_score !== null).length}
              </p>
              <p className="text-xs text-gray-600">Avaliadas</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-orange-600">
                {familiesData.filter(f => f.children_count > 0).length}
              </p>
              <p className="text-xs text-gray-600">C/ Crianças</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-indigo-600">
                {familiesData.filter(f => f.income_range && f.income_range !== 'N/A').length}
              </p>
              <p className="text-xs text-gray-600">C/ Renda</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-purple-600">
                {filteredData.length}
              </p>
              <p className="text-xs text-gray-600">Filtradas</p>
            </div>
          </div>

          {/* Tabela */}
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Família</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Localização</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Mentor</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Status</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Composição</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Renda</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Score</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Nível</th>
                  <th className="text-left py-2 px-2 font-semibold text-gray-700 text-xs">Última Aval.</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 text-xs">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.slice(0, 20).map((family) => (
                  <tr key={family.family_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-2">
                      <div>
                        <p className="font-medium text-gray-900">{family.family_name}</p>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-gray-600">
                          {family.city}, {family.state}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <span className="text-gray-600">
                        {family.mentor_email ? family.mentor_email.split('@')[0] : 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(family.status_aprovacao)}`}>
                        {family.status_aprovacao}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <Users size={12} className="text-gray-400" />
                        <span className="text-gray-600">
                          {family.family_size} ({family.children_count} crianças)
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <span className="text-gray-600">{family.income_range}</span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`font-medium ${getScoreColor(family.poverty_score)}`}>
                        {family.poverty_score ? `${family.poverty_score}/10` : 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPovertyLevelColor(family.poverty_level)}`}>
                        {family.poverty_level || 'N/A'}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        <span className="text-gray-600">
                          {family.assessment_date ? 
                            new Date(family.assessment_date).toLocaleDateString('pt-BR') : 
                            'N/A'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex justify-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                              <Eye size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Users size={20} />
                                Detalhes da Família: {family.family_name}
                              </DialogTitle>
                            </DialogHeader>
                            <FamilyDetailsModal 
                              familyId={family.family_id} 
                              familyName={family.family_name}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação simples */}
          {filteredData.length > 20 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Mostrando 20 de {filteredData.length} famílias
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors">
                  Anterior
                </button>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  Próximo
                </button>
              </div>
            </div>
          )}

          {/* Mensagem quando não há resultados */}
          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">Nenhuma família encontrada</p>
              <p className="text-gray-400 text-sm">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

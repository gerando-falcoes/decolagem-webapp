import { NextRequest, NextResponse } from 'next/server'

// Interface para as metas do SharePoint
export interface SharePointGoal {
  id: string
  dimension: string
  question: string
  goal: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface SharePointGoalsData {
  goals: SharePointGoal[]
  goals_by_dimension: Record<string, SharePointGoal[]>
  last_updated: string
  total_goals: number
}

// Função para processar dados do Excel/SharePoint
function parseSharePointData(data: any[]): SharePointGoalsData {
  const goals: SharePointGoal[] = []
  
  // Processar cada linha (ignorando header)
  data.slice(1).forEach((row, index) => {
    const dimension = row[0]?.toString().toLowerCase().trim() // Coluna A
    const question = row[1]?.toString().trim() // Coluna B  
    const goal = row[2]?.toString().trim() // Coluna C
    
    if (dimension && question && goal) {
      // Mapear dimensões para formato consistente
      const normalizedDimension = normalizeDimension(dimension)
      
      // Determinar prioridade baseada na dimensão
      const priority = getPriorityForDimension(normalizedDimension)
      
      goals.push({
        id: `${normalizedDimension}_${index + 1}`,
        dimension: normalizedDimension,
        question,
        goal,
        priority
      })
    }
  })
  
  // Agrupar por dimensão
  const goalsByDimension = goals.reduce((acc, goal) => {
    if (!acc[goal.dimension]) {
      acc[goal.dimension] = []
    }
    acc[goal.dimension].push(goal)
    return acc
  }, {} as Record<string, SharePointGoal[]>)
  
  return {
    goals,
    goals_by_dimension: goalsByDimension,
    last_updated: new Date().toISOString(),
    total_goals: goals.length
  }
}

// Normalizar nomes das dimensões
function normalizeDimension(dimension: string): string {
  const normalizedMap: Record<string, string> = {
    'moradia': 'moradia',
    'água': 'agua',
    'agua': 'agua',
    'saneamento': 'saneamento',
    'educação': 'educacao',
    'educacao': 'educacao',
    'saúde': 'saude',
    'saude': 'saude',
    'alimentação': 'alimentacao',
    'alimentacao': 'alimentacao',
    'renda diversificada': 'renda_diversificada',
    'renda estável': 'renda_estavel',
    'renda estavel': 'renda_estavel',
    'poupança': 'poupanca',
    'poupanca': 'poupanca',
    'bens e conectividade': 'bens_conectividade',
    'bens': 'bens_conectividade',
    'conectividade': 'bens_conectividade'
  }
  
  const key = dimension.toLowerCase().trim()
  return normalizedMap[key] || key.replace(/\s+/g, '_')
}

// Determinar prioridade baseada na dimensão
function getPriorityForDimension(dimension: string): 'low' | 'medium' | 'high' | 'critical' {
  const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'educacao': 'critical',
    'saude': 'high',
    'agua': 'high',
    'saneamento': 'high',
    'alimentacao': 'high',
    'moradia': 'medium',
    'renda_estavel': 'medium',
    'renda_diversificada': 'medium',
    'poupanca': 'medium',
    'bens_conectividade': 'medium'
  }
  
  return priorityMap[dimension] || 'medium'
}

// Função para buscar dados do SharePoint
async function fetchSharePointData(sharePointUrl: string): Promise<any[]> {
  try {
    // URL real do SharePoint fornecida pelo usuário
    const realSharePointUrl = 'https://pensadoria-my.sharepoint.com/:x:/g/personal/amarberger_pensadoria_com_br/EWY3EZbI1NpAlUvdsRWFK1IB0ny3w-vqSSidFfkN5-zcGw?wdOrigin=TEAMS-WEB.p2p_ns.rwc&wdExp=TEAMS-TREATMENT&wdhostclicktime=1758124453904&web=1'
    
    // Tentar acessar diretamente primeiro (pode funcionar se público)
    try {
      console.log('🔗 Tentando acessar SharePoint URL:', realSharePointUrl)
      
      // Para arquivo Excel do SharePoint, precisamos usar Graph API ou exportar como CSV
      // Por enquanto, usar dados mockados baseados nas imagens até configurar autenticação
      console.log('⚠️ Usando dados mockados - SharePoint requer autenticação')
      
    } catch (sharePointError) {
      console.log('❌ Erro ao acessar SharePoint diretamente:', sharePointError)
    }
    
    // Dados mockados baseados nas suas imagens (temporário até configurar auth)
    const mockData = [
      ['Dimensão', 'Pergunta', 'Meta'], // Header
      ['moradia', 'A moradia tem CEP ou endereço digital, é segura, feita com alvenaria ou estrutura sólida, sem risco imediato de desabamento ou enchente?', 'Solicitar o CEP ou regularizar o endereço junto aos Correios ou prefeitura.'],
      ['moradia', '', 'Fazer pequenos reparos (reboco, telhado, portas/janelas) para melhorar a segurança da casa.'],
      ['moradia', '', 'Organizar um mutirão ou buscar apoio técnico para eliminar riscos de enchente ou desabamento.'],
      
      ['agua', 'A família tem acesso diário à água potável dentro de casa ou em local próximo, de forma segura e regular?', 'Instalar um filtro ou caixa d\'água limpa para garantir a potabilidade.'],
      ['agua', '', 'Organizar a limpeza periódica da caixa d\'água (pelo menos 2 vezes ao ano).'],
      ['agua', '', 'Acionar a companhia de abastecimento ou comunidade para resolver interrupções frequentes.'],
      
      ['saneamento', 'A família possui acesso a banheiro sanitário adequado (com descarga e esgoto), de uso individual ou compartilhado com no máximo uma outra família?', 'Instalar ou consertar o vaso sanitário e a descarga.'],
      ['saneamento', '', 'Providenciar ligação à rede de esgoto ou fossa séptica adequada.'],
      ['saneamento', '', 'Reduzir o número de famílias que compartilham o banheiro (buscar banheiro próprio ou dividir apenas com uma família).'],
      
      ['educacao', 'As crianças da família (6 a 17 anos) estão matriculadas e frequentam a escola regularmente?', 'Garantir matrícula de todas as crianças e adolescentes no início do ano letivo.'],
      ['educacao', '', 'Acompanhar a frequência escolar mensalmente e conversar com a escola se houver faltas.'],
      ['educacao', '', 'Criar um espaço e horário fixo para estudo em casa.'],
      
      ['saude', 'Se alguém ficou doente no último ano, a família conseguiu buscar atendimento médico adequado e acessar os remédios necessários?', 'Cadastrar todos os membros da família no posto de saúde mais próximo.'],
      ['saude', '', 'Organizar documentos e cartão do SUS em local de fácil acesso.'],
      ['saude', '', 'Montar uma pequena farmácia caseira com itens básicos e receitas atualizadas.'],
      
      ['alimentacao', 'Nos últimos 3 meses, todos os membros da família conseguiram fazer pelo menos duas refeições por dia, todos os dias.', 'Planejar a compra mensal de alimentos essenciais (arroz, feijão, legumes, frutas).'],
      ['alimentacao', '', 'Criar ou participar de uma horta comunitária ou doméstica.'],
      ['alimentacao', '', 'Buscar inclusão em programas de apoio alimentar, se necessário.'],
      
      ['renda_diversificada', 'A família possui mais de uma fonte de renda ativa, como trabalho formal/informal, pensão, bicos ou pequenos negócios?', 'Identificar habilidades de cada membro e buscar bicos ou pequenos serviços.'],
      ['renda_diversificada', '', 'Investir parte da renda em uma atividade complementar (vendas, produção artesanal, etc.).'],
      ['renda_diversificada', '', 'Manter pelo menos dois canais de geração de renda ativos.'],
      
      ['renda_estavel', 'A responsável familiar conseguiu manter uma fonte de renda estável (formal ou informal) nos últimos 6 meses, sem interrupções longas?', 'Fortalecer o principal trabalho ou negócio, buscando mais clientes ou horas.'],
      ['renda_estavel', '', 'Guardar parte da renda para cobrir períodos sem trabalho.'],
      ['renda_estavel', '', 'Fazer cursos rápidos para melhorar a qualificação e estabilidade no emprego.'],
      
      ['poupanca', 'A família tem poupança?', 'Guardar mensalmente um valor fixo, mesmo que pequeno.'],
      ['poupanca', '', 'Utilizar uma conta bancária ou aplicativo para manter a poupança separada.'],
      ['poupanca', '', 'Definir um objetivo claro para essa poupança (emergência, reforma, estudo).'],
      
      ['bens_conectividade', 'A família possui acesso à internet e conta com pelo menos três dos seguintes itens: geladeira, ventilador, máquina de lavar roupas ou tanquinho, fogão (a gás ou elétrico) ou televisão?', 'Garantir acesso a um plano de internet acessível e estável dentro das possibilidades da família.'],
      ['bens_conectividade', '', 'Priorizar a compra ou troca de um eletrodoméstico essencial por vez.'],
      ['bens_conectividade', '', 'Cuidar da manutenção dos equipamentos para aumentar sua durabilidade.']
    ]
    
    return mockData
    
    // TODO: Para produção, implementar uma das opções abaixo:
    
    // OPÇÃO 1: Microsoft Graph API (Recomendado)
    /*
    const graphUrl = convertToGraphApiUrl(realSharePointUrl)
    const response = await fetch(graphUrl, {
      headers: {
        'Authorization': 'Bearer ' + await getAccessToken(),
        'Accept': 'application/json',
      }
    })
    */
    
    // OPÇÃO 2: SharePoint REST API
    /*
    const restUrl = convertToRestApiUrl(realSharePointUrl)
    const response = await fetch(restUrl, {
      headers: {
        'Accept': 'application/json; odata=verbose',
        'Authorization': 'Bearer ' + await getAccessToken(),
      }
    })
    */
    
    // OPÇÃO 3: CSV Export (Mais simples, se suportado)
    /*
    const csvUrl = realSharePointUrl.replace('/:x:/', '/:u:') + '&download=1'
    const response = await fetch(csvUrl)
    const csvText = await response.text()
    return parseCSV(csvText)
    */
    
  } catch (error) {
    console.error('Erro ao buscar dados do SharePoint:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sharePointUrl = searchParams.get('url') || process.env.SHAREPOINT_GOALS_URL
    
    if (!sharePointUrl) {
      return NextResponse.json({ 
        error: 'URL do SharePoint não configurada' 
      }, { status: 400 })
    }
    
    // Buscar dados do SharePoint
    const rawData = await fetchSharePointData(sharePointUrl)
    
    // Processar dados
    const processedData = parseSharePointData(rawData)
    
    return NextResponse.json({
      success: true,
      data: processedData,
      source: 'sharepoint',
      url: sharePointUrl,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Erro na API SharePoint Goals:', error)
    return NextResponse.json({ 
      error: 'Erro ao buscar metas do SharePoint',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

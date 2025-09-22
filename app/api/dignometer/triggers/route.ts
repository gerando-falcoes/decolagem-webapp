import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabase/server'

// API para detectar mudanças no dignômetro e gerar recomendações automáticas
export async function POST(request: NextRequest) {
  try {
    const { family_id, answers } = await request.json()
    
    if (!family_id || !answers) {
      return NextResponse.json({ 
        error: 'family_id e answers são obrigatórios' 
      }, { status: 400 })
    }

    const supabase = supabaseServerClient
    
    // 1. Verificar se dignômetro existe
    const { data: existingDignometer, error: fetchError } = await supabase
      .from('dignometro_assessments')
      .select('id, answers, created_at')
      .eq('family_id', family_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Erro ao buscar dignômetro:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // 2. Comparar respostas (se houver dignômetro anterior)
    let isNewVulnerability = false
    let changedDimensions: string[] = []
    
    if (existingDignometer) {
      const oldAnswers = existingDignometer.answers || {}
      
      Object.keys(answers).forEach(dimension => {
        const oldValue = oldAnswers[dimension]
        const newValue = answers[dimension]
        
        // Nova vulnerabilidade: antes true/undefined, agora false
        if ((oldValue === true || oldValue === undefined) && newValue === false) {
          isNewVulnerability = true
          changedDimensions.push(dimension)
        }
      })
    } else {
      // Primeiro dignômetro - todas as dimensões false são vulnerabilidades
      Object.keys(answers).forEach(dimension => {
        if (answers[dimension] === false) {
          isNewVulnerability = true
          changedDimensions.push(dimension)
        }
      })
    }

    // 3. Gerar recomendações automáticas se houver vulnerabilidades
    let autoRecommendations: any[] = []
    
    if (isNewVulnerability && changedDimensions.length > 0) {
      // Buscar metas do SharePoint baseadas na planilha fornecida
      let sharePointGoals: any = {}
      
      try {
        const sharePointResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sharepoint/goals`)
        if (sharePointResponse.ok) {
          const sharePointData = await sharePointResponse.json()
          if (sharePointData.success && sharePointData.data) {
            sharePointGoals = sharePointData.data.goals_by_dimension
          }
        }
      } catch (error) {
        console.log('❌ Erro ao buscar SharePoint, usando fallback:', error)
      }
      
      // Usar metas da planilha fornecida (fallback case se SharePoint falhar)
      const fallbackGoals = sharePointGoals.agua ? sharePointGoals : {
        agua: [
          { goal: 'Instalar um filtro ou caixa d\'água limpa para garantir a potabilidade.', priority_level: 'high', question: 'A família tem acesso diário à água potável dentro de casa ou em local próximo, de forma segura e regular?' },
          { goal: 'Organizar a limpeza periódica da caixa d\'água (pelo menos 2 vezes ao ano).', priority_level: 'medium', question: 'A família tem acesso diário à água potável dentro de casa ou em local próximo, de forma segura e regular?' },
          { goal: 'Acionar a companhia de abastecimento ou comunidade para resolver interrupções frequentes.', priority_level: 'high', question: 'A família tem acesso diário à água potável dentro de casa ou em local próximo, de forma segura e regular?' }
        ],
        saneamento: [
          { goal: 'Instalar ou consertar o vaso sanitário e a descarga.', priority_level: 'high', question: 'A família possui acesso a banheiro sanitário adequado (com descarga e esgoto), de uso individual ou compartilhado com no máximo uma outra família?' },
          { goal: 'Providenciar ligação à rede de esgoto ou fossa séptica adequada.', priority_level: 'critical', question: 'A família possui acesso a banheiro sanitário adequado (com descarga e esgoto), de uso individual ou compartilhado com no máximo uma outra família?' },
          { goal: 'Reduzir o número de famílias que compartilham o banheiro (buscar banheiro próprio ou dividir apenas com uma família).', priority_level: 'medium', question: 'A família possui acesso a banheiro sanitário adequado (com descarga e esgoto), de uso individual ou compartilhado com no máximo uma outra família?' }
        ],
        saude: [
          { goal: 'Cadastrar todos os membros da família no posto de saúde mais próximo.', priority_level: 'high', question: 'Se alguém ficou doente no último ano, a família conseguiu buscar atendimento médico adequado e acessar os remédios necessários?' },
          { goal: 'Organizar documentos e cartão do SUS em local de fácil acesso.', priority_level: 'medium', question: 'Se alguém ficou doente no último ano, a família conseguiu buscar atendimento médico adequado e acessar os remédios necessários?' },
          { goal: 'Montar uma pequena farmácia caseira com itens básicos e receitas atualizadas.', priority_level: 'medium', question: 'Se alguém ficou doente no último ano, a família conseguiu buscar atendimento médico adequado e acessar os remédios necessários?' }
        ],
        moradia: [
          { goal: 'Solicitar o CEP ou regularizar o endereço junto aos Correios ou prefeitura.', priority_level: 'medium', question: 'A moradia tem CEP ou endereço digital, é segura, feita com alvenaria ou estrutura sólida, sem risco imediato de desabamento ou enchente?' },
          { goal: 'Fazer pequenos reparos (reboco, telhado, portas/janelas) para melhorar a segurança da casa.', priority_level: 'medium', question: 'A moradia tem CEP ou endereço digital, é segura, feita com alvenaria ou estrutura sólida, sem risco imediato de desabamento ou enchente?' },
          { goal: 'Organizar um mutirão ou buscar apoio técnico para eliminar riscos de enchente ou desabamento.', priority_level: 'high', question: 'A moradia tem CEP ou endereço digital, é segura, feita com alvenaria ou estrutura sólida, sem risco imediato de desabamento ou enchente?' }
        ],
        educacao: [
          { goal: 'Garantir matrícula de todas as crianças e adolescentes no início do ano letivo.', priority_level: 'critical', question: 'As crianças da família (6 a 17 anos) estão matriculadas e frequentam a escola regularmente?' },
          { goal: 'Acompanhar a frequência escolar mensalmente e conversar com a escola se houver faltas.', priority_level: 'high', question: 'As crianças da família (6 a 17 anos) estão matriculadas e frequentam a escola regularmente?' },
          { goal: 'Criar um espaço e horário fixo para estudo em casa.', priority_level: 'medium', question: 'As crianças da família (6 a 17 anos) estão matriculadas e frequentam a escola regularmente?' }
        ],
        alimentacao: [
          { goal: 'Planejar a compra mensal de alimentos essenciais (arroz, feijão, legumes, frutas).', priority_level: 'high', question: 'Nos últimos 3 meses, todos os membros da família conseguiram fazer pelo menos duas refeições por dia, todos os dias.' },
          { goal: 'Criar ou participar de uma horta comunitária ou doméstica.', priority_level: 'medium', question: 'Nos últimos 3 meses, todos os membros da família conseguiram fazer pelo menos duas refeições por dia, todos os dias.' },
          { goal: 'Buscar inclusão em programas de apoio alimentar, se necessário.', priority_level: 'high', question: 'Nos últimos 3 meses, todos os membros da família conseguiram fazer pelo menos duas refeições por dia, todos os dias.' }
        ],
        renda_diversificada: [
          { goal: 'Identificar habilidades de cada membro e buscar bicos ou pequenos serviços.', priority_level: 'medium', question: 'A família possui mais de uma fonte de renda ativa, como trabalho formal/informal, pensão, bicos ou pequenos negócios?' },
          { goal: 'Investir parte da renda em uma atividade complementar (vendas, produção artesanal, etc.).', priority_level: 'medium', question: 'A família possui mais de uma fonte de renda ativa, como trabalho formal/informal, pensão, bicos ou pequenos negócios?' },
          { goal: 'Manter pelo menos dois canais de geração de renda ativos.', priority_level: 'high', question: 'A família possui mais de uma fonte de renda ativa, como trabalho formal/informal, pensão, bicos ou pequenos negócios?' }
        ],
        renda_estavel: [
          { goal: 'Fortalecer o principal trabalho ou negócio, buscando mais clientes ou horas.', priority_level: 'medium', question: 'A responsável familiar conseguiu manter uma fonte de renda estável (formal ou informal) nos últimos 6 meses, sem interrupções longas?' },
          { goal: 'Guardar parte da renda para cobrir períodos sem trabalho.', priority_level: 'high', question: 'A responsável familiar conseguiu manter uma fonte de renda estável (formal ou informal) nos últimos 6 meses, sem interrupções longas?' },
          { goal: 'Fazer cursos rápidos para melhorar a qualificação e estabilidade no emprego.', priority_level: 'medium', question: 'A responsável familiar conseguiu manter uma fonte de renda estável (formal ou informal) nos últimos 6 meses, sem interrupções longas?' }
        ],
        poupanca: [
          { goal: 'Guardar mensalmente um valor fixo, mesmo que pequeno.', priority_level: 'medium', question: 'A família tem poupança?' },
          { goal: 'Utilizar uma conta bancária ou aplicativo para manter a poupança separada.', priority_level: 'medium', question: 'A família tem poupança?' },
          { goal: 'Definir um objetivo claro para essa poupança (emergência, reforma, estudo).', priority_level: 'medium', question: 'A família tem poupança?' }
        ],
        bens_conectividade: [
          { goal: 'Garantir acesso a um plano de internet acessível e estável dentro das possibilidades da família.', priority_level: 'medium', question: 'A família possui acesso à internet e conta com pelo menos três dos seguintes itens: geladeira, ventilador, máquina de lavar roupas ou tanquinho, fogão (a gás ou elétrico) ou televisão?' },
          { goal: 'Priorizar a compra ou troca de um eletrodoméstico essencial por vez.', priority_level: 'medium', question: 'A família possui acesso à internet e conta com pelo menos três dos seguintes itens: geladeira, ventilador, máquina de lavar roupas ou tanquinho, fogão (a gás ou elétrico) ou televisão?' },
          { goal: 'Cuidar da manutenção dos equipamentos para aumentar sua durabilidade.', priority_level: 'low', question: 'A família possui acesso à internet e conta com pelo menos três dos seguintes itens: geladeira, ventilador, máquina de lavar roupas ou tanquinho, fogão (a gás ou elétrico) ou televisão?' }
        ]
      }
      
      // Gerar recomendações para cada dimensão vulnerável
      changedDimensions.forEach(dimension => {
        const dimensionGoals = fallbackGoals[dimension as keyof typeof fallbackGoals] || []
        dimensionGoals.forEach(goalTemplate => {
          autoRecommendations.push({
            id: `auto_${family_id}_${dimension}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            dimension: dimension,
            goal: goalTemplate.goal_name,
            question: goalTemplate.question,
            priority_level: goalTemplate.priority_level,
            generated_at: new Date().toISOString(),
            trigger_source: 'dignometer_change',
            family_id: family_id,
            auto_generated: true,
            status: 'pending_selection'
          })
        })
      })
    }

    // 4. Salvar recomendações no cache (localStorage será usado no frontend)
    // Por enquanto, retornar as recomendações para o frontend gerenciar

    const result = {
      success: true,
      data: {
        family_id,
        has_new_vulnerabilities: isNewVulnerability,
        changed_dimensions: changedDimensions,
        auto_recommendations: autoRecommendations,
        total_recommendations: autoRecommendations.length,
        recommendations_by_dimension: autoRecommendations.reduce((acc: any, rec: any) => {
          (acc[rec.dimension] = acc[rec.dimension] || []).push(rec)
          return acc
        }, {}),
        trigger_info: {
          timestamp: new Date().toISOString(),
          trigger_type: existingDignometer ? 'dignometer_update' : 'dignometer_create',
          previous_dignometer_id: existingDignometer?.id || null
        }
      }
    }

    console.log('🎯 Trigger dignômetro executado:', {
      family_id,
      vulnerabilities: isNewVulnerability,
      dimensions: changedDimensions,
      recommendations: autoRecommendations.length
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error('Erro no trigger do dignômetro:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// API para buscar recomendações automáticas de uma família
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const family_id = searchParams.get('family_id')
    
    if (!family_id) {
      return NextResponse.json({ 
        error: 'family_id é obrigatório' 
      }, { status: 400 })
    }

    // Buscar último dignômetro da família
    const dignometerResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/families/${family_id}/dignometer/latest`)
    
    if (!dignometerResponse.ok) {
      return NextResponse.json({
        success: true,
        data: {
          family_id,
          has_dignometer: false,
          auto_recommendations: [],
          message: 'Família não possui dignômetro'
        }
      })
    }

    const dignometerResponse_data = await dignometerResponse.json()
    
    // Verificar se há dignômetro e extrair respostas
    if (!dignometerResponse_data.success || !dignometerResponse_data.dignometer) {
      return NextResponse.json({
        success: true,
        data: {
          family_id,
          has_dignometer: false,
          auto_recommendations: [],
          message: 'Família não possui dignômetro'
        }
      })
    }
    
    const dignometerData = dignometerResponse_data.dignometer.answers
    
    // Buscar metas do SharePoint baseadas na planilha fornecida
    let sharePointGoals: any = {}
    
    try {
      const sharePointResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/sharepoint/goals`)
      if (sharePointResponse.ok) {
        const sharePointData = await sharePointResponse.json()
        if (sharePointData.success && sharePointData.data) {
          sharePointGoals = sharePointData.data.goals_by_dimension
        }
      }
    } catch (error) {
      console.log('❌ Erro ao buscar SharePoint, usando fallback:', error)
    }
    
    // Fallback case com metas da planilha se SharePoint falhar
    const fallbackGoals = sharePointGoals.agua ? sharePointGoals : {
      agua: [
        { goal: 'Instalar um filtro ou caixa d\'água limpa para garantir a potabilidade.', priority_level: 'high', question: 'A família tem acesso diário à água potável dentro de casa ou em local próximo, de forma segura e regular?' },
        { goal: 'Organizar a limpeza periódica da caixa d\'água (pelo menos 2 vezes ao ano).', priority_level: 'medium', question: 'A família tem acesso diário à água potável dentro de casa ou em local próximo, de forma segura e regular?' },
        { goal: 'Acionar a companhia de abastecimento ou comunidade para resolver interrupções frequentes.', priority_level: 'high', question: 'A família tem acesso diário à água potável dentro de casa ou em local próximo, de forma segura e regular?' }
      ],
      saneamento: [
        { goal: 'Instalar ou consertar o vaso sanitário e a descarga.', priority_level: 'high', question: 'A família possui acesso a banheiro sanitário adequado (com descarga e esgoto), de uso individual ou compartilhado com no máximo uma outra família?' },
        { goal: 'Providenciar ligação à rede de esgoto ou fossa séptica adequada.', priority_level: 'critical', question: 'A família possui acesso a banheiro sanitário adequado (com descarga e esgoto), de uso individual ou compartilhado com no máximo uma outra família?' },
        { goal: 'Reduzir o número de famílias que compartilham o banheiro (buscar banheiro próprio ou dividir apenas com uma família).', priority_level: 'medium', question: 'A família possui acesso a banheiro sanitário adequado (com descarga e esgoto), de uso individual ou compartilhado com no máximo uma outra família?' }
      ],
      saude: [
        { goal: 'Cadastrar todos os membros da família no posto de saúde mais próximo.', priority_level: 'high', question: 'Se alguém ficou doente no último ano, a família conseguiu buscar atendimento médico adequado e acessar os remédios necessários?' },
        { goal: 'Organizar documentos e cartão do SUS em local de fácil acesso.', priority_level: 'medium', question: 'Se alguém ficou doente no último ano, a família conseguiu buscar atendimento médico adequado e acessar os remédios necessários?' },
        { goal: 'Montar uma pequena farmácia caseira com itens básicos e receitas atualizadas.', priority_level: 'medium', question: 'Se alguém ficou doente no último ano, a família conseguiu buscar atendimento médico adequado e acessar os remédios necessários?' }
      ],
      moradia: [
        { goal: 'Solicitar o CEP ou regularizar o endereço junto aos Correios ou prefeitura.', priority_level: 'medium', question: 'A moradia tem CEP ou endereço digital, é segura, feita com alvenaria ou estrutura sólida, sem risco imediato de desabamento ou enchente?' },
        { goal: 'Fazer pequenos reparos (reboco, telhado, portas/janelas) para melhorar a segurança da casa.', priority_level: 'medium', question: 'A moradia tem CEP ou endereço digital, é segura, feita com alvenaria ou estrutura sólida, sem risco imediato de desabamento ou enchente?' },
        { goal: 'Organizar um mutirão ou buscar apoio técnico para eliminar riscos de enchente ou desabamento.', priority_level: 'high', question: 'A moradia tem CEP ou endereço digital, é segura, feita com alvenaria ou estrutura sólida, sem risco imediato de desabamento ou enchente?' }
      ],
      educacao: [
        { goal: 'Garantir matrícula de todas as crianças e adolescentes no início do ano letivo.', priority_level: 'critical', question: 'As crianças da família (6 a 17 anos) estão matriculadas e frequentam a escola regularmente?' },
        { goal: 'Acompanhar a frequência escolar mensalmente e conversar com a escola se houver faltas.', priority_level: 'high', question: 'As crianças da família (6 a 17 anos) estão matriculadas e frequentam a escola regularmente?' },
        { goal: 'Criar um espaço e horário fixo para estudo em casa.', priority_level: 'medium', question: 'As crianças da família (6 a 17 anos) estão matriculadas e frequentam a escola regularmente?' }
      ],
      alimentacao: [
        { goal: 'Planejar a compra mensal de alimentos essenciais (arroz, feijão, legumes, frutas).', priority_level: 'high', question: 'Nos últimos 3 meses, todos os membros da família conseguiram fazer pelo menos duas refeições por dia, todos os dias.' },
        { goal: 'Criar ou participar de uma horta comunitária ou doméstica.', priority_level: 'medium', question: 'Nos últimos 3 meses, todos os membros da família conseguiram fazer pelo menos duas refeições por dia, todos os dias.' },
        { goal: 'Buscar inclusão em programas de apoio alimentar, se necessário.', priority_level: 'high', question: 'Nos últimos 3 meses, todos os membros da família conseguiram fazer pelo menos duas refeições por dia, todos os dias.' }
      ],
      renda_diversificada: [
        { goal: 'Identificar habilidades de cada membro e buscar bicos ou pequenos serviços.', priority_level: 'medium', question: 'A família possui mais de uma fonte de renda ativa, como trabalho formal/informal, pensão, bicos ou pequenos negócios?' },
        { goal: 'Investir parte da renda em uma atividade complementar (vendas, produção artesanal, etc.).', priority_level: 'medium', question: 'A família possui mais de uma fonte de renda ativa, como trabalho formal/informal, pensão, bicos ou pequenos negócios?' },
        { goal: 'Manter pelo menos dois canais de geração de renda ativos.', priority_level: 'high', question: 'A família possui mais de uma fonte de renda ativa, como trabalho formal/informal, pensão, bicos ou pequenos negócios?' }
      ],
      renda_estavel: [
        { goal: 'Fortalecer o principal trabalho ou negócio, buscando mais clientes ou horas.', priority_level: 'medium', question: 'A responsável familiar conseguiu manter uma fonte de renda estável (formal ou informal) nos últimos 6 meses, sem interrupções longas?' },
        { goal: 'Guardar parte da renda para cobrir períodos sem trabalho.', priority_level: 'high', question: 'A responsável familiar conseguiu manter uma fonte de renda estável (formal ou informal) nos últimos 6 meses, sem interrupções longas?' },
        { goal: 'Fazer cursos rápidos para melhorar a qualificação e estabilidade no emprego.', priority_level: 'medium', question: 'A responsável familiar conseguiu manter uma fonte de renda estável (formal ou informal) nos últimos 6 meses, sem interrupções longas?' }
      ],
      poupanca: [
        { goal: 'Guardar mensalmente um valor fixo, mesmo que pequeno.', priority_level: 'medium', question: 'A família tem poupança?' },
        { goal: 'Utilizar uma conta bancária ou aplicativo para manter a poupança separada.', priority_level: 'medium', question: 'A família tem poupança?' },
        { goal: 'Definir um objetivo claro para essa poupança (emergência, reforma, estudo).', priority_level: 'medium', question: 'A família tem poupança?' }
      ],
      bens_conectividade: [
        { goal: 'Garantir acesso a um plano de internet acessível e estável dentro das possibilidades da família.', priority_level: 'medium', question: 'A família possui acesso à internet e conta com pelo menos três dos seguintes itens: geladeira, ventilador, máquina de lavar roupas ou tanquinho, fogão (a gás ou elétrico) ou televisão?' },
        { goal: 'Priorizar a compra ou troca de um eletrodoméstico essencial por vez.', priority_level: 'medium', question: 'A família possui acesso à internet e conta com pelo menos três dos seguintes itens: geladeira, ventilador, máquina de lavar roupas ou tanquinho, fogão (a gás ou elétrico) ou televisão?' },
        { goal: 'Cuidar da manutenção dos equipamentos para aumentar sua durabilidade.', priority_level: 'low', question: 'A família possui acesso à internet e conta com pelo menos três dos seguintes itens: geladeira, ventilador, máquina de lavar roupas ou tanquinho, fogão (a gás ou elétrico) ou televisão?' }
      ]
    }

    // Gerar recomendações para dimensões vulneráveis (false)
    const vulnerableDimensions = Object.keys(dignometerData).filter(
      dimension => dignometerData[dimension] === false
    )

    const autoRecommendations: any[] = []
    vulnerableDimensions.forEach(dimension => {
      const dimensionGoals = fallbackGoals[dimension as keyof typeof fallbackGoals] || []
      dimensionGoals.forEach(goalTemplate => {
        autoRecommendations.push({
          id: `auto_${family_id}_${dimension}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dimension: dimension,
          goal: goalTemplate.goal_name,
          question: goalTemplate.question,
          priority_level: goalTemplate.priority_level,
          generated_at: new Date().toISOString(),
          trigger_source: 'dignometer_current',
          family_id: family_id,
          auto_generated: true,
          status: 'pending_selection'
        })
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        family_id,
        has_dignometer: true,
        vulnerable_dimensions: vulnerableDimensions,
        auto_recommendations: autoRecommendations,
        total_recommendations: autoRecommendations.length,
        recommendations_by_dimension: autoRecommendations.reduce((acc: any, rec: any) => {
          (acc[rec.dimension] = acc[rec.dimension] || []).push(rec)
          return acc
        }, {}),
        dignometer_answers: dignometerData
      }
    })

  } catch (error) {
    console.error('Erro ao buscar recomendações automáticas:', error)
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '/home/typpo/Documents/Decolagem-WebApp/.env.local' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function processFollowups() {
  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log('Starting followup processing...')

    // 1. Check for overdue goals and mark them as late
    const { data: overdueGoals, error: overdueError } = await supabaseClient
      .from('family_goals')
      .select('*')
      .lt('target_date', new Date().toISOString().split('T')[0])
      .neq('current_status', 'CONCLUIDA')
      .neq('current_status', 'ATRASADA')

    if (overdueError) {
      throw overdueError
    }

    console.log(`Found ${overdueGoals?.length || 0} overdue goals`)

    // Update overdue goals status
    if (overdueGoals && overdueGoals.length > 0) {
      for (const goal of overdueGoals) {
        await supabaseClient
          .from('family_goals')
          .update({ 
            current_status: 'ATRASADA',
            updated_at: new Date().toISOString()
          })
          .eq('id', goal.id)

        // Create alert for overdue goal
        await supabaseClient
          .from('alerts')
          .insert({
            family_id: goal.family_id,
            type: 'meta_atrasada',
            message: `Meta "${goal.goal_title}" está atrasada. Prazo era ${new Date(goal.target_date).toLocaleDateString('pt-BR')}`,
            severity: 'high'
          })

        console.log(`Marked goal ${goal.id} as overdue and created alert`)
      }
    }

    // 2. Check for inactive families (no updates in 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: inactiveFamilies, error: inactiveError } = await supabaseClient
      .from('families')
      .select('*')
      .lt('updated_at', thirtyDaysAgo.toISOString())
      .neq('status', 'inativa')

    if (inactiveError) {
      throw inactiveError
    }

    console.log(`Found ${inactiveFamilies?.length || 0} potentially inactive families`)

    if (inactiveFamilies && inactiveFamilies.length > 0) {
      for (const family of inactiveFamilies) {
        // Check if there's already an inactive alert for this family
        const { data: existingAlert } = await supabaseClient
          .from('alerts')
          .select('id')
          .eq('family_id', family.id)
          .eq('type', 'familia_inativa')
          .is('resolved_at', null)
          .single()

        if (!existingAlert) {
          await supabaseClient
            .from('alerts')
            .insert({
              family_id: family.id,
              type: 'familia_inativa',
              message: `Família "${family.name}" sem atualizações há mais de 30 dias`,
              severity: 'med'
            })

          console.log(`Created inactivity alert for family ${family.id}`)
        }
      }
    }

    // 3. Check for active goals
    const { data: activeGoals, error: activeError } = await supabaseClient
      .from('family_goals')
      .select('*')
      .eq('current_status', 'ATIVA')

    if (activeError) {
      throw activeError
    }

    console.log(`Found ${activeGoals?.length || 0} active goals`)

    // 4. Check for critical situations (families with very low Dignômetro scores)
    const { data: criticalAssessments, error: criticalError } = await supabaseClient
      .from('dignometro_assessments')
      .select(`
        *,
        families (*)
      `)
      .eq('poverty_level', 'critico')
      .gte('assessment_date', thirtyDaysAgo.toISOString().split('T')[0])

    if (criticalError) {
      throw criticalError
    }

    console.log(`Found ${criticalAssessments?.length || 0} critical assessments`)

    if (criticalAssessments && criticalAssessments.length > 0) {
      for (const assessment of criticalAssessments) {
        const family = assessment.families

        // Check if there's already a critical alert for this family
        const { data: existingAlert } = await supabaseClient
          .from('alerts')
          .select('id')
          .eq('family_id', family.id)
          .eq('type', 'situacao_critica')
          .is('resolved_at', null)
          .single()

        if (!existingAlert) {
          await supabaseClient
            .from('alerts')
            .insert({
              family_id: family.id,
              type: 'situacao_critica',
              message: `Família "${family.name}" com Dignômetro crítico (${assessment.poverty_score.toFixed(1)}%)`,
              severity: 'high'
            })

          console.log(`Created critical situation alert for family ${family.id}`)
        }
      }
    }

    // 5. Generate visit reminders for families without recent contact
    const { data: familiesNeedingVisit, error: visitError } = await supabaseClient
      .from('families')
      .select('*')
      .eq('status', 'ativa')

    if (visitError) {
      throw visitError
    }

    let visitRemindersCreated = 0
    if (familiesNeedingVisit && familiesNeedingVisit.length > 0) {
      for (const family of familiesNeedingVisit) {
        // Check if family had a visit reminder in the last 14 days
        const fourteenDaysAgo = new Date()
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

        const { data: recentVisitAlert } = await supabaseClient
          .from('alerts')
          .select('id')
          .eq('family_id', family.id)
          .eq('type', 'lembrete_visita')
          .gte('created_at', fourteenDaysAgo.toISOString())
          .single()

        // Random chance to create visit reminder (simulate scheduling logic)
        if (!recentVisitAlert && Math.random() < 0.1) { // 10% chance
          await supabaseClient
            .from('alerts')
            .insert({
              family_id: family.id,
              type: 'lembrete_visita',
              message: `Lembrete: agendar visita domiciliar para família "${family.name}"`,
              severity: 'low'
            })

          visitRemindersCreated++
        }
      }
    }

    console.log(`Created ${visitRemindersCreated} visit reminders`)

    const summary = {
      timestamp: new Date().toISOString(),
      overdueGoalsProcessed: overdueGoals?.length || 0,
      inactiveFamiliesChecked: inactiveFamilies?.length || 0,
      activeGoalsFollowedUp: activeGoals?.length || 0,
      criticalSituationsFound: criticalAssessments?.length || 0,
      visitRemindersCreated,
      status: 'success'
    }

    console.log('Followup processing completed:', summary)
    return summary

  } catch (error) {
    console.error('Error in followup processing:', error)
    return {
      error: error.message,
      timestamp: new Date().toISOString(),
      status: 'error'
    }
  }
}

// Executar a função
if (require.main === module) {
  processFollowups()
    .then(result => {
      console.log('Resultado:', JSON.stringify(result, null, 2))
      process.exit(0)
    })
    .catch(error => {
      console.error('Erro:', error)
      process.exit(1)
    })
}

module.exports = { processFollowups }

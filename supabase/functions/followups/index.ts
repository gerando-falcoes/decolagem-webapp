const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../../.env.local' })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string
          family_id: string
          dimension_key: string
          title: string
          description: string | null
          status: string
          due_date: string | null
          progress: number
          created_at: string
          updated_at: string
        }
        Update: {
          status?: string
          updated_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          family_id: string
          type: string
          message: string
          severity: string
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          family_id: string
          type: string
          message: string
          severity?: string
        }
      }
      families: {
        Row: {
          id: string
          name: string
          phone: string | null
          whatsapp: string | null
          email: any
          street: string | null
          neighborhood: string | null
          city: string | null
          state: string | null
          reference_point: any
          income_range: string | null
          family_size: number | null
          children_count: number | null
          status: string
          created_at: string
          updated_at: string
          mentor_email: any
        }
        Update: {
          status?: string
          updated_at?: string
        }
      }
      followups: {
        Row: {
          id: string
          goal_id: string
          note: string | null
          next_reminder_at: string | null
        }
        Insert: {
          goal_id: string
          note?: string | null
          next_reminder_at?: string | null
        }
        Update: {
          note?: string | null
          next_reminder_at?: string | null
        }
      }
      assessments: {
        Row: {
          id: string
          family_id: string
          assessed_at: string
          scores_json: any
          total_score: number
          risk_level: string
        }
      }
    }
  }
}

async function processFollowups() {
  try {
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('Starting followup processing...')

    // 1. Check for overdue goals and mark them as late
    const { data: overdueGoals, error: overdueError } = await supabaseClient
      .from('goals')
      .select('*')
      .lt('due_date', new Date().toISOString().split('T')[0])
      .neq('status', 'concluida')
      .neq('status', 'atrasada')

    if (overdueError) {
      throw overdueError
    }

    console.log(`Found ${overdueGoals?.length || 0} overdue goals`)

    // Update overdue goals status
    if (overdueGoals && overdueGoals.length > 0) {
      for (const goal of overdueGoals) {
        await supabaseClient
          .from('goals')
          .update({ 
            status: 'atrasada',
            updated_at: new Date().toISOString()
          })
          .eq('id', goal.id)

        // Create alert for overdue goal
        await supabaseClient
          .from('alerts')
          .insert({
            family_id: goal.family_id,
            type: 'meta_atrasada',
            message: `Meta "${goal.title}" está atrasada. Prazo era ${new Date(goal.due_date!).toLocaleDateString('pt-BR')}`,
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

    // 3. Update followup reminders for goals in progress
    const { data: activeGoals, error: activeError } = await supabaseClient
      .from('goals')
      .select(`
        *,
        followups (*)
      `)
      .eq('status', 'em_andamento')

    if (activeError) {
      throw activeError
    }

    console.log(`Found ${activeGoals?.length || 0} active goals for followup`)

    if (activeGoals && activeGoals.length > 0) {
      for (const goal of activeGoals) {
        const followups = goal.followups as any[]
        
        // Check if goal needs a followup reminder
        const lastFollowup = followups
          .sort((a, b) => new Date(b.next_reminder_at || 0).getTime() - new Date(a.next_reminder_at || 0).getTime())[0]

        const shouldCreateReminder = !lastFollowup || 
          (lastFollowup.next_reminder_at && new Date(lastFollowup.next_reminder_at) <= new Date())

        if (shouldCreateReminder) {
          // Create next reminder date (7 days from now)
          const nextReminder = new Date()
          nextReminder.setDate(nextReminder.getDate() + 7)

          if (lastFollowup) {
            // Update existing followup
            await supabaseClient
              .from('followups')
              .update({
                next_reminder_at: nextReminder.toISOString(),
                note: 'Lembrete automático de acompanhamento'
              })
              .eq('id', lastFollowup.id)
          } else {
            // Create new followup
            await supabaseClient
              .from('followups')
              .insert({
                goal_id: goal.id,
                next_reminder_at: nextReminder.toISOString(),
                note: 'Primeiro lembrete automático de acompanhamento'
              })
          }

          console.log(`Updated followup reminder for goal ${goal.id}`)
        }
      }
    }

    // 4. Check for critical situations (families with very low Dignômetro scores)
    const { data: criticalAssessments, error: criticalError } = await supabaseClient
      .from('assessments')
      .select(`
        *,
        families (*)
      `)
      .eq('risk_level', 'critico')
      .gte('assessed_at', thirtyDaysAgo.toISOString().split('T')[0])

    if (criticalError) {
      throw criticalError
    }

    console.log(`Found ${criticalAssessments?.length || 0} critical assessments`)

    if (criticalAssessments && criticalAssessments.length > 0) {
      for (const assessment of criticalAssessments) {
        const family = (assessment as any).families

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
              message: `Família "${family.name}" com Dignômetro crítico (${assessment.total_score.toFixed(1)}%)`,
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

  } catch (error: unknown) {
    console.error('Error in followup processing:', error)
    if(error instanceof Error) {
    return {
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'error'
      }
    }
    return {
      error: 'Unknown error',
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

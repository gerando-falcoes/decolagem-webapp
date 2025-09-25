/**
 * Script para corrigir dados do dashboard dignometro
 * Execute: node scripts/fix-dashboard-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixDashboardData() {
  console.log('🔧 Iniciando correção dos dados do dashboard...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas');
    console.log('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log('1️⃣ Verificando famílias com avaliações...');
    
    // Buscar famílias com avaliações
    const { data: familiesWithAssessments, error: searchError } = await supabase
      .from('families')
      .select(`
        id, 
        name, 
        status_aprovacao,
        dignometro_assessments(id, poverty_score, poverty_level)
      `)
      .not('dignometro_assessments.id', 'is', null);
    
    if (searchError) {
      console.error('❌ Erro ao buscar famílias:', searchError);
      return;
    }
    
    console.log(`📊 Encontradas ${familiesWithAssessments?.length || 0} famílias com avaliações`);
    
    if (!familiesWithAssessments || familiesWithAssessments.length === 0) {
      console.log('⚠️ Nenhuma família com avaliações encontrada');
      return;
    }
    
    // Filtrar famílias pendentes
    const pendingFamilies = familiesWithAssessments.filter(f => 
      f.status_aprovacao === 'pendente'
    );
    
    console.log(`📋 Famílias pendentes de aprovação: ${pendingFamilies.length}`);
    
    if (pendingFamilies.length === 0) {
      console.log('✅ Todas as famílias com avaliações já estão aprovadas');
      return;
    }
    
    // Aprovar famílias pendentes
    console.log('2️⃣ Aprovando famílias pendentes...');
    
    for (const family of pendingFamilies) {
      console.log(`   Aprovando: ${family.name}`);
      
      const { error: updateError } = await supabase
        .from('families')
        .update({
          status_aprovacao: 'aprovado',
          data_aprovacao: new Date().toISOString()
        })
        .eq('id', family.id);
      
      if (updateError) {
        console.error(`   ❌ Erro ao aprovar ${family.name}:`, updateError);
      } else {
        console.log(`   ✅ ${family.name} aprovada com sucesso`);
      }
    }
    
    console.log('3️⃣ Verificando dados no dashboard...');
    
    // Verificar se aparecem na view do dashboard
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('dignometro_dashboard')
      .select('family_id, family_name, poverty_score, poverty_level')
      .not('poverty_score', 'is', null);
    
    if (dashboardError) {
      console.error('❌ Erro ao verificar dashboard:', dashboardError);
      return;
    }
    
    console.log(`📊 Famílias agora no dashboard: ${dashboardData?.length || 0}`);
    
    if (dashboardData && dashboardData.length > 0) {
      console.log('✅ Dashboard agora tem dados!');
      dashboardData.forEach(family => {
        console.log(`   - ${family.family_name}: ${family.poverty_score} (${family.poverty_level})`);
      });
    } else {
      console.log('⚠️ Dashboard ainda sem dados - pode haver outros problemas');
    }
    
    console.log('4️⃣ Verificando timeline...');
    
    const { data: timelineData, error: timelineError } = await supabase
      .from('dignometro_weekly_timeline')
      .select('*');
    
    if (timelineError) {
      console.error('❌ Erro ao verificar timeline:', timelineError);
    } else {
      console.log(`📈 Registros na timeline: ${timelineData?.length || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixDashboardData()
    .then(() => console.log('🏁 Script finalizado'))
    .catch(error => console.error('💥 Erro fatal:', error));
}

module.exports = { fixDashboardData };

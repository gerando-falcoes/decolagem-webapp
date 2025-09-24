/**
 * Script para aprovar a família teste e permitir visualização no dashboard dignometro
 * Execute: node scripts/aprovar-familia-teste-dignometro.js
 */

const { createClient } = require('@supabase/supabase-js');

async function aprovarFamiliaTeste() {
  console.log('🔍 Iniciando aprovação da família teste...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variáveis de ambiente não configuradas');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // ID da família teste com avaliação
    const familyId = '207fa4bb-19d4-4bae-8961-0b0a09e530e0';
    
    // 1. Verificar situação atual
    console.log('1️⃣ Verificando situação atual...');
    const { data: familyCheck, error: checkError } = await supabase
      .from('families')
      .select('id, name, status_aprovacao')
      .eq('id', familyId)
      .single();
    
    if (checkError) {
      console.error('❌ Erro ao verificar família:', checkError);
      return;
    }
    
    console.log('📋 Família encontrada:', familyCheck);
    
    // 2. Aprovar família
    console.log('2️⃣ Aprovando família...');
    const { data: updateData, error: updateError } = await supabase
      .from('families')
      .update({
        status_aprovacao: 'aprovado',
        data_aprovacao: new Date().toISOString()
      })
      .eq('id', familyId)
      .select();
    
    if (updateError) {
      console.error('❌ Erro ao aprovar família:', updateError);
      return;
    }
    
    console.log('✅ Família aprovada com sucesso!', updateData);
    
    // 3. Verificar se aparece na view
    console.log('3️⃣ Verificando se aparece na view dignometro_dashboard...');
    const { data: dashboardData, error: dashboardError } = await supabase
      .from('dignometro_dashboard')
      .select('family_id, family_name, poverty_score, poverty_level')
      .eq('family_id', familyId);
    
    if (dashboardError) {
      console.error('❌ Erro ao verificar dashboard:', dashboardError);
      return;
    }
    
    if (dashboardData && dashboardData.length > 0) {
      console.log('🎉 Família aparece no dashboard:', dashboardData);
    } else {
      console.log('⚠️ Família ainda não aparece no dashboard');
    }
    
    // 4. Verificar total de famílias no dashboard
    console.log('4️⃣ Verificando total de famílias no dashboard...');
    const { data: totalData, error: totalError } = await supabase
      .from('dignometro_dashboard')
      .select('family_id', { count: 'exact' });
    
    if (totalError) {
      console.error('❌ Erro ao contar famílias:', totalError);
      return;
    }
    
    console.log(`📊 Total de famílias no dashboard: ${totalData?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  aprovarFamiliaTeste()
    .then(() => console.log('🏁 Script finalizado'))
    .catch(error => console.error('💥 Erro fatal:', error));
}

module.exports = { aprovarFamiliaTeste };

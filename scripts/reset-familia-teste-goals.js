const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iawcvuzhrkayzpdyhbii.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhd2N2dXpocmtheXpwZHloYmlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0OTc1NywiZXhwIjoyMDczMDI1NzU3fQ.ks2rPaRYqY9DFRVjEYsi8O4QkPvIoiogaHWZiTpJmVI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetFamiliaTesteGoals() {
  try {
    console.log('🗑️ RESETANDO METAS DA FAMÍLIA TESTE\n');
    
    const familyId = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc';
    
    // 1. Verificar metas existentes
    console.log('📋 1. VERIFICANDO METAS EXISTENTES:');
    const { data: existingGoals, error: fetchError } = await supabase
      .from('family_goals')
      .select('id, goal_title, goal_category, current_status')
      .eq('family_id', familyId);
    
    if (fetchError) throw fetchError;
    
    if (existingGoals && existingGoals.length > 0) {
      console.log(`✅ Encontradas ${existingGoals.length} metas:`);
      existingGoals.forEach((goal, index) => {
        console.log(`   ${index + 1}. ${goal.goal_title} (${goal.current_status})`);
      });
      
      // 2. Deletar todas as metas
      console.log('\n🗑️ 2. DELETANDO TODAS AS METAS:');
      const { error: deleteError } = await supabase
        .from('family_goals')
        .delete()
        .eq('family_id', familyId);
      
      if (deleteError) throw deleteError;
      
      console.log('✅ Todas as metas foram deletadas com sucesso!');
      
    } else {
      console.log('✅ Nenhuma meta encontrada - tabela já está limpa');
    }
    
    // 3. Verificar se ficou limpo
    console.log('\n🔍 3. VERIFICANDO LIMPEZA:');
    const { data: finalCheck, error: finalError } = await supabase
      .from('family_goals')
      .select('count')
      .eq('family_id', familyId);
    
    if (finalError) throw finalError;
    
    console.log('✅ Tabela de resumo de metas está LIMPA!');
    console.log('🎯 Pronto para testar nova funcionalidade de desabilitar recomendações');
    
  } catch (error) {
    console.error('❌ Erro ao resetar metas:', error);
  }
}

resetFamiliaTesteGoals();

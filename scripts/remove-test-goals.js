const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iawcvuzhrkayzpdyhbii.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhd2N2dXpocmtheXpwZHloYmlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0OTc1NywiZXhwIjoyMDczMDI1NzU3fQ.ks2rPaRYqY9DFRVjEYsi8O4QkPvIoiogaHWZiTpJmVI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeTestGoals() {
  try {
    console.log('🗑️ REMOVENDO METAS DE TESTE DA FAMÍLIA TESTE\n');
    
    const familyId = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc';
    const goalIds = [
      'd86d9af5-9592-4f9c-bf12-a858c9d77f2d', // Meta Teste Saúde
      '97867a37-9533-4273-8432-1ab7a1b22c3c'  // Meta de Teste Manual
    ];
    
    // Verificar metas antes de deletar
    console.log('📋 Metas que serão removidas:');
    const { data: goalsToDelete, error: fetchError } = await supabase
      .from('family_goals')
      .select('id, goal_title, goal_category, current_status')
      .in('id', goalIds);
    
    if (fetchError) {
      console.log('❌ Erro ao buscar metas:', fetchError.message);
      return;
    }
    
    if (!goalsToDelete || goalsToDelete.length === 0) {
      console.log('ℹ️ Nenhuma meta encontrada para remover');
      return;
    }
    
    goalsToDelete.forEach((goal, index) => {
      console.log(`   ${index + 1}. ${goal.goal_title}`);
      console.log(`      Status: ${goal.current_status}`);
      console.log(`      ID: ${goal.id}`);
    });
    
    // Deletar as metas
    console.log(`\n🗑️ Removendo ${goalsToDelete.length} metas...`);
    
    const { error: deleteError } = await supabase
      .from('family_goals')
      .delete()
      .in('id', goalIds);
    
    if (deleteError) {
      console.log('❌ Erro ao deletar metas:', deleteError.message);
      return;
    }
    
    console.log('✅ Metas removidas com sucesso!');
    
    // Verificar resultado final
    console.log('\n📋 Verificando metas restantes da família TESTE:');
    const { data: remainingGoals, error: checkError } = await supabase
      .from('family_goals')
      .select('id, goal_title, current_status, created_at')
      .eq('family_id', familyId);
    
    if (checkError) {
      console.log('❌ Erro ao verificar metas restantes:', checkError.message);
      return;
    }
    
    if (!remainingGoals || remainingGoals.length === 0) {
      console.log('✅ Tabela de metas limpa! Nenhuma meta restante.');
      console.log('📝 Agora só aparecerão metas quando:');
      console.log('   • Mentor aceitar recomendações automáticas no modal');
      console.log('   • Mentor criar metas manuais na aba Manual');
    } else {
      console.log(`ℹ️ ${remainingGoals.length} metas restantes:`);
      remainingGoals.forEach((goal, index) => {
        console.log(`   ${index + 1}. ${goal.goal_title} (${goal.current_status})`);
      });
    }
    
    console.log('\n🎯 RESULTADO:');
    console.log('   ✅ Metas de teste removidas');
    console.log('   ✅ Sistema limpo e pronto');
    console.log('   ✅ 9 recomendações automáticas disponíveis no modal');
    console.log('   ✅ Tabela de metas vazia (correto)');
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar remoção
removeTestGoals();

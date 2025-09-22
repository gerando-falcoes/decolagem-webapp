const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase - usando variáveis diretas como fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iawcvuzhrkayzpdyhbii.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhd2N2dXpocmtheXpwZHloYmlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0OTc1NywiZXhwIjoyMDczMDI1NzU3fQ.ks2rPaRYqY9DFRVjEYsi8O4QkPvIoiogaHWZiTpJmVI';

console.log('🔧 Configuração Supabase:');
console.log('  URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
console.log('  Key:', supabaseServiceKey ? '✅ Configurado' : '❌ Não configurado');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDignometerForFamiliaTeste() {
  try {
    console.log('🔧 Criando dignômetro para família TESTE...');
    
    const familyId = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc';
    
    // Verificar se família existe
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('id, name')
      .eq('id', familyId)
      .single();
    
    if (familyError || !family) {
      console.log('❌ Família TESTE não encontrada:', familyError?.message);
      return;
    }
    
    console.log('✅ Família encontrada:', family.name);
    
    // Verificar se já tem dignômetro
    const { data: existingAssessments, error: checkError } = await supabase
      .from('dignometro_assessments')
      .select('id')
      .eq('family_id', familyId);
    
    if (checkError) {
      console.log('❌ Erro ao verificar dignômetro:', checkError.message);
      return;
    }
    
    if (existingAssessments && existingAssessments.length > 0) {
      console.log('⚠️ Família TESTE já possui dignômetro. Removendo primeiro...');
      
      // Remover dignômetros existentes
      const { error: deleteError } = await supabase
        .from('dignometro_assessments')
        .delete()
        .eq('family_id', familyId);
      
      if (deleteError) {
        console.log('❌ Erro ao remover dignômetro antigo:', deleteError.message);
        return;
      }
      
      console.log('✅ Dignômetro antigo removido');
    }
    
    // Criar novo dignômetro com vulnerabilidades específicas
    const dignometerData = {
      family_id: familyId,
      answers: {
        moradia: true,           // OK
        agua: false,             // VULNERÁVEL  
        saneamento: false,       // VULNERÁVEL
        educacao: true,          // OK
        saude: false,            // VULNERÁVEL
        alimentacao: true,       // OK
        renda_diversificada: true, // OK
        renda_estavel: true,     // OK
        poupanca: true,          // OK
        bens_conectividade: true // OK
      },
      poverty_score: 4.5,
      poverty_level: 'Vulnerabilidade',
      dimension_scores: {
        moradia: 8.0,
        agua: 2.0,              // Score baixo = vulnerável
        saneamento: 1.0,        // Score baixo = vulnerável  
        educacao: 7.5,
        saude: 3.0,             // Score baixo = vulnerável
        alimentacao: 8.5,
        renda_diversificada: 6.0,
        renda_estavel: 7.0,
        poupanca: 8.0,
        bens_conectividade: 9.0
      },
      assessment_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    
    const { data: newAssessment, error: insertError } = await supabase
      .from('dignometro_assessments')
      .insert([dignometerData])
      .select();
    
    if (insertError) {
      console.log('❌ Erro ao criar dignômetro:', insertError.message);
      return;
    }
    
    console.log('✅ Dignômetro criado com sucesso!');
    console.log('📊 Assessment ID:', newAssessment[0].id);
    console.log('🎯 Score:', newAssessment[0].poverty_score);
    console.log('🏷️ Nível:', newAssessment[0].poverty_level);
    
    // Verificar dimensões vulneráveis
    const vulnerableDimensions = Object.entries(dignometerData.answers)
      .filter(([key, value]) => value === false)
      .map(([key]) => key);
    
    console.log('🚨 Dimensões vulneráveis:', vulnerableDimensions);
    console.log('📋 Total de vulnerabilidades:', vulnerableDimensions.length);
    console.log('🎯 Metas esperadas:', vulnerableDimensions.length * 3, '(3 por dimensão)');
    
    console.log('\n✅ SUCESSO! Dignômetro criado para família TESTE');
    console.log('📝 Próximos passos:');
    console.log('   1. Testar API de recomendações');
    console.log('   2. Verificar interface da família TESTE');
    console.log('   3. Confirmar que aparecem 9 recomendações automáticas');
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar script
createDignometerForFamiliaTeste();

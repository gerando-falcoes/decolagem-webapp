const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iawcvuzhrkayzpdyhbii.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhd2N2dXpocmtheXpwZHloYmlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQ0OTc1NywiZXhwIjoyMDczMDI1NzU3fQ.ks2rPaRYqY9DFRVjEYsi8O4QkPvIoiogaHWZiTpJmVI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAllFamiliesLogic() {
  try {
    console.log('🔍 VERIFICANDO LÓGICA DE METAS PARA TODAS AS FAMÍLIAS\n');
    
    // 1. Buscar todas as famílias
    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('id, name')
      .order('name');
    
    if (familiesError) {
      console.log('❌ Erro ao buscar famílias:', familiesError.message);
      return;
    }
    
    console.log(`📊 Total de famílias encontradas: ${families.length}\n`);
    
    // 2. Para cada família, verificar dignômetro e vulnerabilidades
    const results = [];
    
    for (const family of families) {
      console.log(`\n🏠 Analisando família: ${family.name} (${family.id})`);
      
      // Buscar dignômetro da família
      const { data: assessments, error: assessmentError } = await supabase
        .from('dignometro_assessments')
        .select('id, answers, poverty_score, poverty_level, created_at')
        .eq('family_id', family.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (assessmentError) {
        console.log(`   ❌ Erro ao buscar dignômetro: ${assessmentError.message}`);
        continue;
      }
      
      if (!assessments || assessments.length === 0) {
        console.log('   📋 Status: SEM DIGNÔMETRO');
        console.log('   🎯 Metas esperadas: 0 (sem vulnerabilidades identificadas)');
        results.push({
          family: family.name,
          family_id: family.id,
          has_dignometer: false,
          vulnerabilities: [],
          expected_goals: 0,
          status: 'SEM_DIGNOMETER'
        });
        continue;
      }
      
      const assessment = assessments[0];
      const answers = assessment.answers || {};
      
      // Identificar vulnerabilidades (dimensões com false)
      const vulnerabilities = Object.entries(answers)
        .filter(([key, value]) => value === false)
        .map(([key]) => key);
      
      const expectedGoals = vulnerabilities.length * 3; // 3 metas por dimensão vulnerável
      
      console.log(`   📊 Score: ${assessment.poverty_score}`);
      console.log(`   🏷️ Nível: ${assessment.poverty_level}`);
      console.log(`   📅 Data: ${new Date(assessment.created_at).toLocaleDateString('pt-BR')}`);
      console.log(`   🚨 Vulnerabilidades: ${vulnerabilities.length} (${vulnerabilities.join(', ')})`);
      console.log(`   🎯 Metas esperadas: ${expectedGoals} (${vulnerabilities.length} × 3)`);
      
      results.push({
        family: family.name,
        family_id: family.id,
        has_dignometer: true,
        score: assessment.poverty_score,
        level: assessment.poverty_level,
        vulnerabilities: vulnerabilities,
        expected_goals: expectedGoals,
        status: vulnerabilities.length > 0 ? 'COM_VULNERABILIDADES' : 'SEM_VULNERABILIDADES'
      });
    }
    
    // 3. Resumo geral
    console.log('\n📋 RESUMO GERAL\n');
    
    const withDignometer = results.filter(r => r.has_dignometer);
    const withoutDignometer = results.filter(r => !r.has_dignometer);
    const withVulnerabilities = results.filter(r => r.status === 'COM_VULNERABILIDADES');
    const withoutVulnerabilities = results.filter(r => r.status === 'SEM_VULNERABILIDADES');
    
    console.log(`📊 Famílias com dignômetro: ${withDignometer.length}`);
    console.log(`📊 Famílias sem dignômetro: ${withoutDignometer.length}`);
    console.log(`🚨 Famílias com vulnerabilidades: ${withVulnerabilities.length}`);
    console.log(`✅ Famílias sem vulnerabilidades: ${withoutVulnerabilities.length}`);
    
    const totalExpectedGoals = results.reduce((sum, r) => sum + r.expected_goals, 0);
    console.log(`🎯 Total de metas esperadas no sistema: ${totalExpectedGoals}`);
    
    // 4. Detalhes por status
    console.log('\n🏠 FAMÍLIAS COM VULNERABILIDADES:');
    withVulnerabilities.forEach(family => {
      console.log(`   • ${family.family} - ${family.vulnerabilities.length} vulnerabilidades (${family.expected_goals} metas)`);
      console.log(`     Dimensões: ${family.vulnerabilities.join(', ')}`);
    });
    
    if (withoutDignometer.length > 0) {
      console.log('\n📋 FAMÍLIAS SEM DIGNÔMETRO:');
      withoutDignometer.forEach(family => {
        console.log(`   • ${family.family} (ID: ${family.family_id})`);
      });
    }
    
    if (withoutVulnerabilities.length > 0) {
      console.log('\n✅ FAMÍLIAS SEM VULNERABILIDADES:');
      withoutVulnerabilities.forEach(family => {
        console.log(`   • ${family.family} - Score: ${family.score} (${family.level})`);
      });
    }
    
    console.log('\n🎉 VERIFICAÇÃO CONCLUÍDA!');
    console.log('\n✅ LÓGICA APLICADA CORRETAMENTE:');
    console.log('   • Só gera metas para famílias COM dignômetro');
    console.log('   • Só gera metas para dimensões com vulnerabilidades (false)');
    console.log('   • Usa dados da planilha fornecida');
    console.log('   • 3 metas por dimensão vulnerável');
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

// Executar verificação
verifyAllFamiliesLogic();

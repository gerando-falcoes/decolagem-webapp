-- Script para criar sessão do dignômetro para a família TESTE
-- Família ID: a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc
-- 
-- PROBLEMA: Família TESTE não possui dignômetro, então não aparece recomendações
-- SOLUÇÃO: Criar sessão com dimensões vulneráveis para gerar recomendações automáticas

-- Verificar se a família existe
SELECT id, name FROM families WHERE id = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc';

-- Verificar se já existe dignômetro (deve retornar 0)
SELECT COUNT(*) as existing_dignometer FROM dignometro_assessments 
WHERE family_id = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc';

-- Inserir nova sessão do dignômetro com vulnerabilidades em água, saneamento e saúde
INSERT INTO dignometro_assessments (
  family_id, 
  answers, 
  poverty_score, 
  poverty_level, 
  dimension_scores, 
  assessment_date, 
  created_at
) VALUES (
  'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc',
  '{
    "moradia": true,
    "agua": false,
    "saneamento": false,
    "educacao": true,
    "saude": false,
    "alimentacao": true,
    "renda_diversificada": true,
    "renda_estavel": true,
    "poupanca": true,
    "bens_conectividade": true
  }'::jsonb,
  4.5,
  'Vulnerabilidade',
  '{
    "moradia": 8.0,
    "agua": 2.0,
    "saneamento": 1.0,
    "educacao": 7.5,
    "saude": 3.0,
    "alimentacao": 8.5,
    "renda_diversificada": 6.0,
    "renda_estavel": 7.0,
    "poupanca": 8.0,
    "bens_conectividade": 9.0
  }'::jsonb,
  CURRENT_DATE,
  NOW()
);

-- Verificar se o dignômetro foi inserido corretamente
SELECT 
  id,
  family_id,
  answers,
  poverty_score,
  poverty_level,
  assessment_date,
  created_at
FROM dignometro_assessments 
WHERE family_id = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc';

-- Verificar dimensões vulneráveis (devem ser: agua, saneamento, saude)
SELECT 
  key as dimension,
  value as is_satisfactory,
  CASE WHEN value::boolean = false THEN 'VULNERÁVEL' ELSE 'OK' END as status
FROM dignometro_assessments da,
     jsonb_each(da.answers)
WHERE da.family_id = 'a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc'
ORDER BY key;

-- RESULTADO ESPERADO:
-- Dimensões vulneráveis (false): agua, saneamento, saude
-- Dimensões satisfatórias (true): moradia, educacao, alimentacao, renda_diversificada, renda_estavel, poupanca, bens_conectividade
-- 
-- Isso deve gerar 9 recomendações automáticas:
-- - 3 para água
-- - 3 para saneamento  
-- - 3 para saúde

-- INSTRUÇÕES PARA APLICAR:
-- 1. Abra o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole e execute este script SQL
-- 4. Verifique se o dignômetro foi criado
-- 5. Teste a aplicação: http://localhost:3000/families/a0b1c1dd-6608-4bf1-b41b-9a39eaacc5dc

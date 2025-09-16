# Sistema de Metas Recomendadas - Prompt Atualizado

## Contexto do Projeto Decolagem v4

Baseado na análise da estrutura atual do banco de dados Supabase, o projeto possui:

### Estrutura Atual Identificada

**Tabelas Principais:**
- `families` (58 registros) - Dados básicos das famílias
- `dignometro_assessments` (2 registros) - Avaliações do dignômetro
- `family_goals` (47 registros) - **Metas pré-estabelecidas no sistema**
- `family_goal_assignments` (0 registros) - Atribuições de metas
- `profiles` (26 registros) - Perfis de usuários/mentores

**View Existente:**
- `family_overview` - View consolidada com dados de famílias, avaliações e metas

### Estrutura das Respostas do Dignômetro (Base para Recomendação)

As respostas estão armazenadas em formato JSONB na coluna `answers` da tabela `dignometro_assessments`:

**Estrutura das respostas (conforme dimensões configuradas no sistema):**
```json
{
  "moradia": "valor_resposta",
  "agua": "valor_resposta",
  "saneamento": "valor_resposta",
  "educacao": "valor_resposta",
  "saude": "valor_resposta",
  "alimentacao": "valor_resposta",
  "renda_diversificada": "valor_resposta",
  "renda_estavel": "valor_resposta",
  "poupanca": "valor_resposta",
  "bens_conectividade": "valor_resposta"
}
```

**Dimensões configuradas no sistema (10 dimensões):**
- `moradia` (Moradia) - condições de habitação
- `agua` (Água) - acesso e qualidade da água
- `saneamento` (Saneamento) - condições de saneamento básico
- `educacao` (Educação) - acesso à educação
- `saude` (Saúde) - acesso a cuidados de saúde
- `alimentacao` (Alimentação) - segurança alimentar
- `renda_diversificada` (Renda Diversificada) - diversificação de fontes de renda
- `renda_estavel` (Renda Estável) - estabilidade da renda principal
- `poupanca` (Poupança) - capacidade de poupança
- `bens_conectividade` (Bens e Conectividade) - acesso a bens e tecnologia

### Metas Pré-estabelecidas no Sistema (47 metas cadastradas)

**Exemplos de metas existentes na base:**
- "Garantir segurança alimentar"
- "Melhorar acesso à saúde"
- "Estabilizar renda familiar"
- "Criar oportunidades de emprego"
- "Melhorar condições de moradia"
- "Garantir educação para crianças"
- "Instalar filtro de água"
- "Cadastro no posto de saúde"
- "Desenvolver hábitos de poupança"
- "Implementar saneamento básico"

## Objetivo

Implementar um sistema de **recomendação de metas** que:
1. **Leia as respostas** da coluna `answers` em `dignometro_assessments`
2. **Analise as dimensões** com respostas indicativas de vulnerabilidade
3. **Recomende metas específicas** já cadastradas no sistema baseadas na lógica de vulnerabilidade
4. **Integre com o modal** de metas existente sem alterar a estrutura atual

## Tarefas e Requisitos

### 1) Lógica de Recomendação Baseada nas Respostas do Dignômetro

**Princípio**: Analisar as respostas da coluna `answers` e recomendar metas pré-estabelecidas quando há indicação de vulnerabilidade.

**Regras de Vulnerabilidade por Dimensão (baseadas nas 10 dimensões configuradas):**
- `moradia`: valores que indicam problemas → recomendar metas de moradia
- `agua`: valores que indicam problemas → recomendar metas de água potável
- `saneamento`: valores que indicam problemas → recomendar metas de saneamento
- `educacao`: valores que indicam problemas → recomendar metas de educação
- `saude`: valores que indicam problemas → recomendar metas de saúde  
- `alimentacao`: valores que indicam problemas → recomendar metas de alimentação
- `renda_diversificada`: valores que indicam problemas → recomendar metas de diversificação
- `renda_estavel`: valores que indicam problemas → recomendar metas de estabilização
- `poupanca`: valores que indicam problemas → recomendar metas de poupança
- `bens_conectividade`: valores que indicam problemas → recomendar metas de conectividade

**Nota:** A lógica específica de quais valores indicam vulnerabilidade será definida quando os formulários forem configurados.

### 2) Tabela de Mapeamento entre Respostas e Metas Existentes

```sql
CREATE TABLE IF NOT EXISTS public.dignometer_goal_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dimension TEXT NOT NULL, -- moradia, agua, saneamento, educacao, saude, alimentacao, renda_diversificada, renda_estavel, poupanca, bens_conectividade
  dimension_value TEXT NOT NULL, -- valor que indica vulnerabilidade
  existing_goal_title TEXT NOT NULL, -- título exato da meta existente em family_goals
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (dimension, dimension_value, existing_goal_title)
);
```

### 3) Tabela de Metas Recomendadas (baseada nas respostas do dignômetro)

```sql
CREATE TABLE IF NOT EXISTS public.recommended_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_id UUID NOT NULL REFERENCES families(id),
  assessment_id UUID NOT NULL REFERENCES dignometro_assessments(id),
  dimension TEXT NOT NULL, -- dimensão que gerou a recomendação
  dimension_value TEXT NOT NULL, -- valor específico que indicou vulnerabilidade
  existing_goal_id UUID NULL REFERENCES family_goals(id), -- referência à meta pré-estabelecida
  existing_goal_title TEXT NOT NULL, -- título da meta existente
  priority TEXT DEFAULT 'medium',
  source TEXT DEFAULT 'dignometer_analysis',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (family_id, assessment_id, dimension, existing_goal_title)
);
```

### 4) Função de Análise e Recomendação baseada nas Respostas do Dignômetro

```sql
CREATE OR REPLACE FUNCTION sync_recommended_goals(assessment_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  inserted_count INTEGER := 0;
  assessment_data RECORD;
  dimension_key TEXT;
  dimension_value TEXT;
  mapping_record RECORD;
  existing_goal RECORD;
BEGIN
  -- Buscar dados do assessment com as respostas
  SELECT * INTO assessment_data 
  FROM dignometro_assessments 
  WHERE id = assessment_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Assessment não encontrado');
  END IF;
  
  -- Limpar recomendações anteriores para este assessment
  DELETE FROM recommended_goals WHERE assessment_id = assessment_id_param;
  
  -- Analisar cada dimensão das respostas do dignômetro
  FOR dimension_key, dimension_value IN 
    SELECT key, value FROM jsonb_each_text(assessment_data.answers)
  LOOP
    -- Buscar mapeamentos para dimensões que indicam vulnerabilidade
    FOR mapping_record IN 
      SELECT * FROM dignometer_goal_mapping 
      WHERE dimension = dimension_key 
        AND dimension_value = dimension_value
    LOOP
      -- Buscar a meta pré-estabelecida correspondente
      SELECT * INTO existing_goal 
      FROM family_goals 
      WHERE goal_title = mapping_record.existing_goal_title
      LIMIT 1;
      
      IF FOUND THEN
        -- Inserir recomendação baseada na meta existente
        INSERT INTO recommended_goals (
          family_id, assessment_id, dimension, dimension_value,
          existing_goal_id, existing_goal_title, priority
        ) VALUES (
          assessment_data.family_id, assessment_id_param, dimension_key, dimension_value,
          existing_goal.id, existing_goal.goal_title, mapping_record.priority
        ) ON CONFLICT (family_id, assessment_id, dimension, existing_goal_title) DO NOTHING;
        
        inserted_count := inserted_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  result := json_build_object(
    'success', true,
    'assessment_id', assessment_id_param,
    'family_id', assessment_data.family_id,
    'dimensions_analyzed', jsonb_object_keys(assessment_data.answers),
    'recommendations_generated', inserted_count
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### 4) View para Consumo

```sql
CREATE OR REPLACE VIEW public.vw_family_recommended_goals AS
WITH latest_assessments AS (
  SELECT 
    family_id,
    MAX(created_at) as latest_assessment_date
  FROM dignometro_assessments
  GROUP BY family_id
)
SELECT 
  rg.family_id,
  rg.dimension,
  rg.dimension_value,
  rg.goal_title,
  rg.goal_category,
  rg.priority,
  rg.created_at as recommended_at,
  la.latest_assessment_date,
  f.name as family_name
FROM recommended_goals rg
JOIN latest_assessments la ON la.family_id = rg.family_id
JOIN families f ON f.id = rg.family_id
WHERE rg.assessment_id IN (
  SELECT id FROM dignometro_assessments da 
  WHERE da.family_id = rg.family_id 
    AND da.created_at = la.latest_assessment_date
);
```

### 5) População Inicial do Mapeamento (baseado nas 10 dimensões e metas reais do sistema)

```sql
-- Mapeamentos baseados nas 10 dimensões configuradas e metas pré-estabelecidas existentes
-- NOTA: Os valores específicos de vulnerabilidade serão definidos quando os formulários forem configurados

INSERT INTO dignometer_goal_mapping (dimension, dimension_value, existing_goal_title, priority) VALUES

-- MORADIA - problemas de habitação
('moradia', 'problematico', 'Melhorar condições de moradia', 'high'),
('moradia', 'critico', 'Melhorar condições de moradia', 'critical'),

-- ÁGUA - problemas de acesso/qualidade
('agua', 'problematico', 'Garantir água potável', 'high'),
('agua', 'critico', 'Garantir água potável', 'critical'),
('agua', 'problematico', 'Instalar filtro de água', 'medium'),

-- SANEAMENTO - problemas de saneamento básico
('saneamento', 'problematico', 'Implementar saneamento básico', 'high'),
('saneamento', 'critico', 'Implementar saneamento básico', 'critical'),
('saneamento', 'problematico', 'Banheiro funcional', 'medium'),
('saneamento', 'problematico', 'Conectar à rede de esgoto', 'medium'),

-- EDUCAÇÃO - problemas educacionais
('educacao', 'problematico', 'Garantir educação para crianças', 'high'),
('educacao', 'critico', 'Garantir educação para crianças', 'critical'),
('educacao', 'problematico', 'Matrícula e frequência escolar', 'high'),

-- SAÚDE - problemas de saúde
('saude', 'problematico', 'Melhorar acesso à saúde', 'high'),
('saude', 'critico', 'Melhorar acesso à saúde', 'critical'),
('saude', 'problematico', 'Cadastro no posto de saúde', 'medium'),

-- ALIMENTAÇÃO - insegurança alimentar
('alimentacao', 'problematico', 'Garantir segurança alimentar', 'high'),
('alimentacao', 'critico', 'Garantir segurança alimentar', 'critical'),

-- RENDA DIVERSIFICADA - falta de diversificação
('renda_diversificada', 'problematico', 'Diversificar fontes de renda', 'high'),
('renda_diversificada', 'critico', 'Diversificar fontes de renda', 'critical'),
('renda_diversificada', 'problematico', 'Criar oportunidades de emprego', 'medium'),

-- RENDA ESTÁVEL - instabilidade na renda
('renda_estavel', 'problematico', 'Estabilizar renda familiar', 'high'),
('renda_estavel', 'critico', 'Estabilizar renda familiar', 'critical'),
('renda_estavel', 'problematico', 'Criar oportunidades de emprego', 'medium'),

-- POUPANÇA - problemas de poupança
('poupanca', 'problematico', 'Desenvolver hábitos de poupança', 'medium'),
('poupanca', 'critico', 'Desenvolver hábitos de poupança', 'high'),
('poupanca', 'problematico', 'Iniciar poupança mensal', 'medium'),

-- BENS E CONECTIVIDADE - falta de acesso a bens/tecnologia
('bens_conectividade', 'problematico', 'Adquirir eletrodomésticos essenciais', 'medium'),
('bens_conectividade', 'critico', 'Adquirir eletrodomésticos essenciais', 'high'),
('bens_conectividade', 'problematico', 'Internet acessível e estável', 'medium');
```

### 6) API Endpoint

Criar `app/api/recommendations/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const familyId = searchParams.get('family_id')
  
  if (!familyId) {
    return NextResponse.json({ error: 'family_id é obrigatório' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseServerClient
      .from('vw_family_recommended_goals')
      .select('*')
      .eq('family_id', familyId)
      .order('priority', { ascending: false })
      .order('dimension')

    if (error) throw error

    // Agrupar por dimensão
    const groupedByDimension = data?.reduce((acc, goal) => {
      if (!acc[goal.dimension]) {
        acc[goal.dimension] = []
      }
      acc[goal.dimension].push({
        goal_title: goal.goal_title,
        goal_category: goal.goal_category,
        priority: goal.priority,
        dimension_value: goal.dimension_value,
        recommended_at: goal.recommended_at
      })
      return acc
    }, {} as Record<string, any[]>) || {}

    return NextResponse.json({
      family_id: familyId,
      family_name: data?.[0]?.family_name,
      total_recommendations: data?.length || 0,
      dimensions: Object.entries(groupedByDimension).map(([dimension, goals]) => ({
        dimension,
        dimension_label: getDimensionLabel(dimension),
        goals_count: goals.length,
        goals
      }))
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar recomendações' }, { status: 500 })
  }
}

function getDimensionLabel(dimension: string): string {
  const labels = {
    moradia: 'Moradia',
    agua: 'Água',
    saneamento: 'Saneamento',
    educacao: 'Educação',
    saude: 'Saúde',
    alimentacao: 'Alimentação',
    renda_diversificada: 'Renda Diversificada',
    renda_estavel: 'Renda Estável',
    poupanca: 'Poupança',
    bens_conectividade: 'Bens e Conectividade'
  }
  return labels[dimension] || dimension
}
```

### 7) Hook para Metas Recomendadas

Criar `hooks/useRecommendedGoals.ts`:

```typescript
import { useState, useEffect } from 'react'

export interface RecommendedGoal {
  dimension: string
  dimension_label: string
  goal_title: string
  goal_category: string
  priority: string
  dimension_value: string
  recommended_at: string
}

export interface RecommendedGoalsResponse {
  family_id: string
  family_name: string
  dimensions: {
    dimension: string
    dimension_label: string
    goals: RecommendedGoal[]
  }[]
}

export function useRecommendedGoals(familyId: string | null) {
  const [data, setData] = useState<RecommendedGoalsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!familyId) return

    async function fetchRecommendedGoals() {
      try {
        setLoading(true)
        const response = await fetch(`/api/recommendations?family_id=${familyId}`)
        const data = await response.json()
        
        if (response.ok) {
          setData(data)
        } else {
          setError(data.error)
        }
      } catch (err) {
        setError('Erro ao carregar metas recomendadas')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendedGoals()
  }, [familyId])

  return { data, loading, error }
}
```

### 8) Integração com Modal de Metas

Atualizar `components/families/meta-modal.tsx` para:

1. **Buscar metas recomendadas** usando o hook `useRecommendedGoals`
2. **Exibir seção "Metas Recomendadas pelo Dignômetro"** com base nas respostas
3. **Manter funcionalidade existente** de metas personalizadas
4. **Agrupar por dimensão** com ícones e cores apropriadas

### 9) Função para Sincronizar Após Nova Avaliação

```sql
-- Trigger para sincronizar automaticamente após nova avaliação
CREATE OR REPLACE FUNCTION trigger_sync_recommended_goals()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM sync_recommended_goals(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_recommended_goals_trigger
  AFTER INSERT ON dignometro_assessments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_recommended_goals();
```

### 10) Testes de Funcionamento com Dados Reais

**Exemplo de teste com dados existentes:**

```sql
-- 1. Testar a função com um assessment real existente
SELECT sync_recommended_goals('4d70d04d-7a27-4b20-bee6-ab94cf8ee815');

-- 2. Verificar as recomendações geradas
SELECT * FROM recommended_goals WHERE assessment_id = '4d70d04d-7a27-4b20-bee6-ab94cf8ee815';

-- 3. Testar a view de consumo
SELECT * FROM vw_family_recommended_goals WHERE family_id = 'e2da494a-4fbd-45ae-be4b-d01f0e69712d';
```

**Validação esperada:** Para o assessment com respostas:
```json
{
  "food": "secure",         // ✅ NÃO gera recomendação (valor seguro)
  "health": "very-poor",    // ❌ GERA recomendação (vulnerabilidade crítica)
  "income": "very-insufficient", // ❌ GERA recomendação (vulnerabilidade crítica)  
  "housing": "excellent",   // ✅ NÃO gera recomendação (valor seguro)
  "education": "illiterate" // ❌ GERA recomendação (vulnerabilidade)
}
```

**Resultado esperado:** 3 dimensões com recomendações (health, income, education)

### 11) Performance e Segurança

- **Índices**: Criar índices nas colunas mais consultadas
- **RLS**: Verificar se as políticas de segurança estão adequadas
- **Cache**: Considerar cache para recomendações frequentes

## Entregáveis

1. **Migrações SQL** 
   - Tabela `dignometer_goal_mapping` (mapeamento respostas → metas)
   - Tabela `recommended_goals` (recomendações baseadas no dignômetro)
   - Função `sync_recommended_goals()` (análise das respostas)
   - View `vw_family_recommended_goals` (consumo otimizado)
   - Trigger automático para novos assessments

2. **Backend/API**
   - Endpoint `/api/recommendations` para buscar metas recomendadas
   - Integração com dados reais do dignômetro

3. **Frontend**
   - Hook `useRecommendedGoals` para consumo no frontend
   - Integração com modal de metas existente
   - Seção "Metas Recomendadas pelo Dignômetro"

4. **População de Dados**
   - Mapeamentos iniciais baseados nas metas reais do sistema
   - Lógica de priorização por vulnerabilidade

5. **Testes e Validação**
   - Testes com dados reais existentes na base
   - Validação da lógica de recomendação

## Considerações Importantes

- **FOCO PRINCIPAL**: Analisar respostas da coluna `answers` em `dignometro_assessments`
- **Metas pré-estabelecidas**: Usar as 47 metas já cadastradas em `family_goals`
- **Lógica de vulnerabilidade**: Apenas valores que indicam problemas geram recomendações
- **Não alterar** estrutura existente, apenas estender funcionalidade
- **Usar dados reais** para testes (assessment ID: `4d70d04d-7a27-4b20-bee6-ab94cf8ee815`)

## Fluxo de Funcionamento

1. **Nova avaliação digitômetro** → respostas salvas em `answers` (JSONB)
2. **Trigger automático** → executa `sync_recommended_goals()`
3. **Função analisa respostas** → identifica vulnerabilidades por dimensão
4. **Consulta mapeamentos** → busca metas pré-estabelecidas correspondentes
5. **Gera recomendações** → salva em `recommended_goals`
6. **Frontend consulta** → via API `/api/recommendations`
7. **Modal exibe metas** → integrado com interface existente

## Resultado Esperado

**Para uma família com assessment:**
```json
{
  "health": "very-poor",
  "income": "very-insufficient", 
  "education": "illiterate"
}
```

**Sistema recomendará automaticamente:**
- Melhorar acesso à saúde (crítica)
- Cadastro no posto de saúde (alta)
- Estabilizar renda familiar (crítica)
- Criar oportunidades de emprego (alta)
- Garantir educação para crianças (alta)
- Matrícula e frequência escolar (alta)

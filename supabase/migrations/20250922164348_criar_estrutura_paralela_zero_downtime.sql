-- MIGRATION: Criar estrutura paralela (zero downtime)
-- MANTÉM family_goals original + view family_overview funcionando

-- Passo 1: Backup (sempre fazer backup primeiro)
CREATE TABLE IF NOT EXISTS family_goals_backup AS SELECT * FROM family_goals;

-- Passo 2: Criar nova tabela de templates (nome diferente para não conflitar)
CREATE TABLE IF NOT EXISTS goal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_name VARCHAR(255) NOT NULL,
  goal_description TEXT NOT NULL,
  dimension VARCHAR(100) NOT NULL DEFAULT 'Personalizada',
  is_active BOOLEAN DEFAULT true,
  order_priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Passo 3: Popular templates com dados do CSV
INSERT INTO goal_templates (id, goal_name, goal_description, dimension, is_active, order_priority, created_at, updated_at) VALUES
(gen_random_uuid(), 'Regularizar endereço junto aos Correios', 'Solicitar o CEP ou regularizar o endereço junto aos Correios ou prefeitura.', 'Moradia', true, 1, NOW(), NOW()),
(gen_random_uuid(), 'Instalar sistema de filtração de água', 'Instalar um filtro ou caixa d''água limpa para garantir a potabilidade.', 'Água', true, 2, NOW(), NOW()),
(gen_random_uuid(), 'Instalar ou consertar sistema sanitário', 'Instalar ou consertar o vaso sanitário e a descarga.', 'Saneamento', true, 3, NOW(), NOW()),
(gen_random_uuid(), 'Garantir matrícula escolar das crianças', 'Garantir matrícula de todas as crianças e adolescentes no início do ano letivo.', 'Educação', true, 4, NOW(), NOW()),
(gen_random_uuid(), 'Cadastrar família no posto de saúde', 'Cadastrar todos os membros da família no posto de saúde mais próximo.', 'Saúde', true, 5, NOW(), NOW()),
(gen_random_uuid(), 'Planejar compra de alimentos essenciais', 'Planejar a compra mensal de alimentos essenciais (arroz, feijão, legumes, frutas).', 'Alimentação', true, 6, NOW(), NOW()),
(gen_random_uuid(), 'Desenvolver habilidades para renda extra', 'Identificar habilidades de cada membro e buscar bicos ou pequenos serviços.', 'Renda Diversificada', true, 7, NOW(), NOW()),
(gen_random_uuid(), 'Fortalecer fonte de renda principal', 'Fortalecer o principal trabalho ou negócio, buscando mais clientes ou horas.', 'Renda Estável', true, 8, NOW(), NOW()),
(gen_random_uuid(), 'Estabelecer hábito de poupança', 'Guardar mensalmente um valor fixo, mesmo que pequeno.', 'Poupança', true, 9, NOW(), NOW()),
(gen_random_uuid(), 'Garantir acesso à internet', 'Garantir acesso a um plano de internet acessível e estável dentro das possibilidades da família.', 'Bens e Conectividade', true, 10, NOW(), NOW());

-- Passo 4: Ajustar family_goal_assignments para trabalhar com goal_templates
ALTER TABLE family_goal_assignments 
  ADD COLUMN IF NOT EXISTS goal_template_id UUID REFERENCES goal_templates(id),
  ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES dignometro_assessments(id),
  ADD COLUMN IF NOT EXISTS goal_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS goal_description TEXT,
  ADD COLUMN IF NOT EXISTS dimension VARCHAR(100) DEFAULT 'Personalizada',
  ADD COLUMN IF NOT EXISTS target_date DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';

-- Ajustar campo de status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'family_goal_assignments' 
                   AND column_name = 'current_status') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'family_goal_assignments' 
                   AND column_name = 'assignment_status') THEN
            ALTER TABLE family_goal_assignments 
            RENAME COLUMN assignment_status TO current_status;
        ELSE
            ALTER TABLE family_goal_assignments 
            ADD COLUMN current_status VARCHAR(50) DEFAULT 'PENDENTE';
        END IF;
    END IF;
END $$;

-- Garantir que goal_name seja NOT NULL para novos registros
UPDATE family_goal_assignments 
SET goal_name = 'Meta sem nome' 
WHERE goal_name IS NULL;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'family_goal_assignments' 
               AND column_name = 'goal_name'
               AND is_nullable = 'YES') THEN
        ALTER TABLE family_goal_assignments 
        ALTER COLUMN goal_name SET NOT NULL;
    END IF;
END $$;

-- Passo 5: Migrar dados existentes (MANTENDO family_goals original intacta)
INSERT INTO family_goal_assignments (
  id,
  family_id,
  goal_template_id,
  assessment_id,
  goal_name,
  goal_description,
  dimension,
  target_date,
  current_status,
  progress_percentage,
  source,
  notes,
  created_at,
  updated_at
)
SELECT 
  fg.id,
  fg.family_id,
  NULL as goal_template_id, -- Sem template correspondente
  fg.assessment_id,
  COALESCE(fg.goal_title, 'Meta sem título') as goal_name,
  COALESCE(fg.goal_category, 'Sem descrição') as goal_description,
  CASE 
    WHEN LOWER(COALESCE(fg.goal_category, '')) LIKE '%água%' OR LOWER(COALESCE(fg.goal_title, '')) LIKE '%água%' THEN 'Água'
    WHEN LOWER(COALESCE(fg.goal_category, '')) LIKE '%saneamento%' OR LOWER(COALESCE(fg.goal_title, '')) LIKE '%banheiro%' THEN 'Saneamento'
    WHEN LOWER(COALESCE(fg.goal_category, '')) LIKE '%educação%' OR LOWER(COALESCE(fg.goal_title, '')) LIKE '%escola%' THEN 'Educação'
    WHEN LOWER(COALESCE(fg.goal_category, '')) LIKE '%saúde%' OR LOWER(COALESCE(fg.goal_title, '')) LIKE '%médico%' THEN 'Saúde'
    WHEN LOWER(COALESCE(fg.goal_category, '')) LIKE '%moradia%' OR LOWER(COALESCE(fg.goal_title, '')) LIKE '%casa%' THEN 'Moradia'
    WHEN LOWER(COALESCE(fg.goal_category, '')) LIKE '%alimentação%' OR LOWER(COALESCE(fg.goal_title, '')) LIKE '%comida%' THEN 'Alimentação'
    WHEN LOWER(COALESCE(fg.goal_category, '')) LIKE '%renda%' OR LOWER(COALESCE(fg.goal_title, '')) LIKE '%emprego%' THEN 'Renda Estável'
    WHEN LOWER(COALESCE(fg.goal_category, '')) LIKE '%poupança%' OR LOWER(COALESCE(fg.goal_title, '')) LIKE '%economia%' THEN 'Poupança'
    ELSE 'Personalizada'
  END as dimension,
  fg.target_date,
  COALESCE(fg.current_status, 'PENDENTE') as current_status,
  COALESCE(fg.progress_percentage, 0) as progress_percentage,
  'migrated' as source,
  'Meta migrada do sistema anterior' as notes,
  COALESCE(fg.created_at, NOW()),
  COALESCE(fg.updated_at, NOW())
FROM family_goals fg
WHERE NOT EXISTS (
  SELECT 1 FROM family_goal_assignments fga 
  WHERE fga.id = fg.id
) -- Evita duplicações se executar novamente
AND EXISTS (SELECT 1 FROM families f WHERE f.id = fg.family_id); -- Só migra se família existir
-- Migration: Fix mentor_name default value in family_overview view
-- Remove "Carlos Mendes" as default value and use NULL instead
-- 
-- PROBLEMA IDENTIFICADO:
-- A view family_overview estava usando 'Carlos Mendes' como valor padrão
-- quando não havia mentor associado à família, através desta linha:
-- COALESCE(mi.mentor_name, 'Carlos Mendes'::text) AS mentor_name
--
-- SOLUÇÃO:
-- Remover o valor padrão 'Carlos Mendes' e usar NULL (mi.mentor_name diretamente)

-- Drop the existing view
DROP VIEW IF EXISTS family_overview;

-- Recreate the view without the Carlos Mendes default
CREATE VIEW family_overview AS
WITH latest_assessment AS (
    SELECT DISTINCT ON (dignometro_assessments.family_id) 
        dignometro_assessments.family_id,
        dignometro_assessments.id AS assessment_id,
        dignometro_assessments.poverty_score,
        dignometro_assessments.poverty_level,
        dignometro_assessments.dimension_scores,
        dignometro_assessments.assessment_date,
        dignometro_assessments.created_at
    FROM dignometro_assessments
    ORDER BY dignometro_assessments.family_id, 
             dignometro_assessments.assessment_date DESC, 
             dignometro_assessments.created_at DESC
), mentor_info AS (
    SELECT 
        profiles.email,
        profiles.name AS mentor_name,
        profiles.phone AS mentor_phone,
        profiles.role AS mentor_role
    FROM profiles
    WHERE (profiles.role = 'mentor'::text)
), goal_summary AS (
    SELECT 
        family_goals.family_id,
        count(*) AS total_goals,
        count(CASE WHEN (family_goals.current_status = 'ATIVA'::text) THEN 1 ELSE NULL::integer END) AS active_goals,
        count(CASE WHEN (family_goals.current_status = 'CONCLUIDA'::text) THEN 1 ELSE NULL::integer END) AS completed_goals,
        count(CASE WHEN (family_goals.current_status = 'SUGERIDA'::text) THEN 1 ELSE NULL::integer END) AS suggested_goals,
        avg(family_goals.progress_percentage) AS avg_progress
    FROM family_goals
    GROUP BY family_goals.family_id
), assessment_history AS (
    SELECT 
        dignometro_assessments.family_id,
        count(*) AS total_assessments,
        min(dignometro_assessments.assessment_date) AS first_assessment_date,
        max(dignometro_assessments.assessment_date) AS last_assessment_date
    FROM dignometro_assessments
    WHERE (dignometro_assessments.assessment_date IS NOT NULL)
    GROUP BY dignometro_assessments.family_id
)
SELECT 
    f.id AS family_id,
    f.name AS family_name,
    f.phone,
    f.whatsapp,
    f.email,
    f.family_size,
    f.children_count,
    f.status AS family_status,
    f.income_range,
    f.street,
    f.neighborhood,
    f.city,
    f.state,
    f.reference_point,
    concat_ws(', '::text, NULLIF(f.street, ''::text), NULLIF(f.neighborhood, ''::text), NULLIF(f.city, ''::text), NULLIF(f.state, ''::text)) AS full_address,
    f.mentor_email,
    mi.mentor_name,  -- ✅ ALTERAÇÃO: Removido COALESCE(mi.mentor_name, 'Carlos Mendes'::text)
    mi.mentor_phone,
    mi.mentor_role,
    la.assessment_id AS latest_assessment_id,
    la.poverty_score AS current_poverty_score,
    la.poverty_level AS current_poverty_level,
    la.dimension_scores AS current_dimension_scores,
    la.assessment_date AS latest_assessment_date,
    COALESCE(ah.total_assessments, (0)::bigint) AS total_assessments,
    ah.first_assessment_date,
    ah.last_assessment_date,
    COALESCE(gs.total_goals, (0)::bigint) AS total_goals,
    COALESCE(gs.active_goals, (0)::bigint) AS active_goals,
    COALESCE(gs.completed_goals, (0)::bigint) AS completed_goals,
    COALESCE(gs.suggested_goals, (0)::bigint) AS suggested_goals,
    round(COALESCE(gs.avg_progress, (0)::numeric), 2) AS avg_goal_progress,
    CASE
        WHEN (la.assessment_id IS NOT NULL) THEN 'Avaliado'::text
        ELSE 'Não Avaliado'::text
    END AS assessment_status,
    CASE
        WHEN (la.poverty_level IS NOT NULL) THEN la.poverty_level
        WHEN ((la.poverty_score IS NOT NULL) AND (la.poverty_score >= 7.5)) THEN 'Dignidade'::text
        WHEN ((la.poverty_score IS NOT NULL) AND (la.poverty_score >= 5.0)) THEN 'Vulnerabilidade'::text
        WHEN (la.poverty_score IS NOT NULL) THEN 'Pobreza'::text
        ELSE 'Não Classificado'::text
    END AS dignity_classification,
    f.created_at AS family_created_at,
    f.updated_at AS family_updated_at,
    CASE
        WHEN ((f.mentor_email IS NOT NULL) OR (mi.mentor_name IS NOT NULL)) THEN true
        ELSE false
    END AS has_active_mentor,
    CASE
        WHEN (gs.active_goals > 0) THEN true
        ELSE false
    END AS has_active_goals,
    CASE
        WHEN (la.assessment_date IS NOT NULL) THEN (CURRENT_DATE - la.assessment_date)
        ELSE NULL::integer
    END AS days_since_last_assessment
FROM ((((families f
    LEFT JOIN latest_assessment la ON ((f.id = la.family_id)))
    LEFT JOIN mentor_info mi ON ((f.mentor_email = mi.email)))
    LEFT JOIN goal_summary gs ON ((f.id = gs.family_id)))
    LEFT JOIN assessment_history ah ON ((f.id = ah.family_id)))
ORDER BY f.name;

-- Verificar o resultado
SELECT COUNT(*) as total_families_with_null_mentor 
FROM family_overview 
WHERE mentor_name IS NULL;

SELECT COUNT(*) as total_families_with_carlos_mendes 
FROM family_overview 
WHERE mentor_name = 'Carlos Mendes';

-- INSTRUÇÕES PARA APLICAR:
-- 1. Execute este script SQL no Supabase Dashboard ou via CLI
-- 2. Ou aplique via supabase CLI: supabase db push
-- 3. Ou copie e cole no SQL Editor do Supabase Dashboard

-- RESULTADO ESPERADO:
-- - Todas as famílias que antes tinham mentor_name = 'Carlos Mendes' 
--   agora terão mentor_name = NULL
-- - Apenas famílias com mentores reais associados terão mentor_name preenchido

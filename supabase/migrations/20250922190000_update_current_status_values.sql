-- Atualizar valores da coluna current_status na tabela family_goal_assignments

-- 1. Atualizar registros existentes para os novos valores
UPDATE family_goal_assignments 
SET current_status = CASE 
    WHEN current_status IN ('assigned', 'in_progress', 'PENDENTE', 'ATIVA', 'EM_ANDAMENTO') THEN 'Em progresso'
    WHEN current_status IN ('paused', 'cancelled', 'PAUSADA', 'CANCELADA') THEN 'Parada'
    ELSE 'Em progresso'
END;

-- 2. Adicionar constraint para garantir apenas valores válidos
ALTER TABLE family_goal_assignments 
DROP CONSTRAINT IF EXISTS family_goal_assignments_current_status_check;

ALTER TABLE family_goal_assignments 
ADD CONSTRAINT family_goal_assignments_current_status_check 
CHECK (current_status IN ('Em progresso', 'Parada'));

-- 3. Alterar valor padrão para 'Em progresso'
ALTER TABLE family_goal_assignments 
ALTER COLUMN current_status SET DEFAULT 'Em progresso';

-- 4. Comentário explicativo
COMMENT ON COLUMN family_goal_assignments.current_status 
IS 'Status da meta: "Em progresso" (meta ativa) ou "Parada" (meta pausada/interrompida)';

-- 5. Garantir que progress_percentage seja 0 por padrão para novas metas
ALTER TABLE family_goal_assignments 
ALTER COLUMN progress_percentage SET DEFAULT 0;

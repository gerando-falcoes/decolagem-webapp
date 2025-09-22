-- Corrigir constraint de current_status na tabela family_goal_assignments

-- 1. Remover constraint antiga
ALTER TABLE family_goal_assignments 
DROP CONSTRAINT IF EXISTS family_goal_assignments_assignment_status_check;

-- 2. Adicionar nova constraint com os valores corretos
ALTER TABLE family_goal_assignments 
ADD CONSTRAINT family_goal_assignments_assignment_status_check 
CHECK (current_status IN ('Em progresso', 'Parada'));

-- 3. Atualizar registros existentes para os novos valores
UPDATE family_goal_assignments 
SET current_status = CASE 
    WHEN current_status IN ('assigned', 'in_progress') THEN 'Em progresso'
    WHEN current_status IN ('paused', 'cancelled') THEN 'Parada'
    WHEN current_status IN ('completed') THEN 'Em progresso' -- Manter como em progresso se estava concluída
    ELSE 'Em progresso'
END;

-- 4. Verificar se há registros que ainda não estão nos novos valores
SELECT current_status, COUNT(*) 
FROM family_goal_assignments 
GROUP BY current_status;

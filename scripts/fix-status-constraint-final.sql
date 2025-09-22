-- Script para corrigir a constraint de status das metas
-- Adiciona 'Cancelada' e 'Concluída' aos status permitidos

-- 1. Remover constraint antiga
ALTER TABLE family_goal_assignments 
DROP CONSTRAINT IF EXISTS family_goal_assignments_assignment_status_check;

-- 2. Adicionar nova constraint com todos os status necessários
ALTER TABLE family_goal_assignments 
ADD CONSTRAINT family_goal_assignments_assignment_status_check 
CHECK (current_status IN ('Em progresso', 'Parada', 'Cancelada', 'Concluída'));

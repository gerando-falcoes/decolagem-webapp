-- Script para adicionar status "Cancelada" na tabela family_goal_assignments
-- Execute este script no Supabase SQL Editor

-- 1. Remover constraint atual
ALTER TABLE family_goal_assignments 
DROP CONSTRAINT IF EXISTS family_goal_assignments_assignment_status_check;

-- 2. Adicionar nova constraint incluindo "Cancelada"
ALTER TABLE family_goal_assignments 
ADD CONSTRAINT family_goal_assignments_assignment_status_check 
CHECK (current_status IN ('Em progresso', 'Parada', 'Cancelada'));

-- 3. Verificar se a constraint foi aplicada corretamente
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'family_goal_assignments'::regclass
AND contype = 'c'
AND conname = 'family_goal_assignments_assignment_status_check';

# Configuração do Supabase

Este diretório contém toda a configuração necessária para conectar o projeto com o Supabase.

## Arquivos

- `client.ts` - Cliente Supabase para uso no lado do cliente (browser)
- `server.ts` - Cliente Supabase para uso no servidor (server-side) com privilégios administrativos
- `types.ts` - Tipos TypeScript completos para o banco de dados
- `index.ts` - Ponto de entrada centralizado para exportar todas as funcionalidades

## Estrutura do Banco de Dados

O projeto está conectado a um banco Supabase com as seguintes tabelas principais:

### Tabelas Principais
- **profiles** - Perfis de usuários (mentores, gestores, admins)
- **families** - Famílias atendidas pelo programa
- **family_members** - Membros das famílias
- **assessments** - Avaliações Dignômetro
- **goals** - Metas das famílias
- **followups** - Acompanhamentos das metas
- **alerts** - Alertas automáticos do sistema
- **attachments** - Anexos e documentos
- **audit_logs** - Logs de auditoria

### Sistema de Metas
- **dignometro_dimensions** - Dimensões do Dignômetro
- **dignometro_questions** - Perguntas do Dignômetro
- **dignometro_responses** - Respostas das famílias
- **goal_templates** - Templates de metas automáticas
- **family_goals** - Metas específicas das famílias
- **family_goal_events** - Eventos das metas

## Como usar

### No lado do cliente (browser)

```typescript
import { supabase } from '@/lib/supabase'

// Exemplo: Buscar famílias
const { data: families, error } = await supabase
  .from('families')
  .select('*')
  .eq('status', 'ativa')

// Exemplo: Inserir nova família
const { data: newFamily, error } = await supabase
  .from('families')
  .insert({
    name: 'Família Silva',
    phone: '11999999999',
    status: 'ativa'
  })
  .select()
  .single()
```

### No servidor (API routes, Server Components)

```typescript
import { supabaseAdmin } from '@/lib/supabase'

// Exemplo: Operações administrativas
const { data, error } = await supabaseAdmin
  .from('families')
  .select('*')
```

### Tipos TypeScript

Todos os tipos estão disponíveis e tipados:

```typescript
import { Database } from '@/lib/supabase/types'

// Exemplo de uso com tipos
const family: Database['public']['Tables']['families']['Row'] = {
  id: 'uuid',
  name: 'Família Silva',
  // ... outros campos tipados
}
```

## Edge Functions

### Followups Automáticos

O projeto inclui uma Edge Function para processamento automático de followups:

- **Localização**: `supabase/functions/followups/index.ts`
- **Funcionalidades**:
  - Marca metas atrasadas automaticamente
  - Cria alertas para famílias inativas
  - Gera lembretes de acompanhamento
  - Detecta situações críticas
  - Agenda lembretes de visita

## Variáveis de ambiente

As seguintes variáveis devem estar configuradas no arquivo `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave pública anônima
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço (apenas para uso no servidor)

## Scripts de Teste

### Verificar Schema do Banco
```bash
node scripts/simple-db-check.js
```

### Testar Integração Completa
```bash
node scripts/test-integration.js
```

## Status da Integração

✅ **Conexão**: Estabelecida e funcionando  
✅ **Tipos TypeScript**: Completos e validados  
✅ **CRUD Operations**: Inserção, consulta, atualização e exclusão funcionando  
✅ **Edge Functions**: Configuradas e prontas para deploy  
✅ **Schema**: Compatível com o banco existente  

## Próximos passos

1. Deploy da Edge Function no Supabase
2. Configurar políticas RLS (Row Level Security) se necessário
3. Implementar autenticação de usuários
4. Integrar com o frontend existente

# Deploy da Edge Function: calculate-weekly-scores

## 📋 **Instruções de Deploy**

### **1. Deploy via Supabase CLI**
```bash
# Navegar para o diretório do projeto
cd /path/to/decolagem-v4

# Deploy da função
supabase functions deploy calculate-weekly-scores

# Verificar se foi deployada
supabase functions list
```

### **2. Deploy via Dashboard**
1. Acesse o Supabase Dashboard
2. Vá em "Edge Functions"
3. Clique em "New Function"
4. Nome: `calculate-weekly-scores`
5. Copie o conteúdo do arquivo `index.ts`
6. Deploy

### **3. Configurar Variáveis de Ambiente**
Certifique-se que as seguintes variáveis estão configuradas:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### **4. Testar a Função**

#### **Teste Manual:**
```bash
# Testar semana atual
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/calculate-weekly-scores" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"

# Testar semana específica
curl -X POST "https://[PROJECT_REF].supabase.co/functions/v1/calculate-weekly-scores?date=2025-09-16" \
  -H "Authorization: Bearer [ANON_KEY]" \
  -H "Content-Type: application/json"
```

#### **Teste via Frontend:**
```typescript
const response = await fetch('/api/calculate-weekly-scores', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
})
const result = await response.json()
console.log(result)
```

### **5. Logs e Monitoramento**
```bash
# Ver logs da função
supabase functions logs calculate-weekly-scores

# Ver logs em tempo real
supabase functions logs calculate-weekly-scores --follow
```

## 🔧 **Como a Função Funciona**

1. **Recebe requisição** (GET/POST)
2. **Determina a semana** para calcular (atual ou especificada via query param `date`)
3. **Busca avaliações** da semana na tabela `dignometro_assessments`
4. **Calcula média** das pontuações
5. **Salva/atualiza** dados na tabela `weekly_dignometro_scores`
6. **Retorna resultado** em JSON

## 📊 **Formato de Resposta**

### **Sucesso com dados:**
```json
{
  "success": true,
  "message": "Pontuação semanal calculada e salva com sucesso",
  "week_data": {
    "week_start_date": "2025-09-16",
    "week_end_date": "2025-09-22",
    "year": 2025,
    "week_number": 38,
    "average_score": 4.6,
    "total_assessments": 5
  },
  "saved_record": { ... }
}
```

### **Sucesso sem dados:**
```json
{
  "success": true,
  "message": "Nenhuma avaliação encontrada para esta semana",
  "week_data": {
    "week_start_date": "2025-09-16",
    "week_end_date": "2025-09-22",
    "year": 2025,
    "week_number": 38,
    "total_assessments": 0
  }
}
```

### **Erro:**
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "timestamp": "2025-09-17T14:30:00.000Z"
}
```

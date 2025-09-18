# 🔗 **CONFIGURAÇÃO SHAREPOINT - GUIA COMPLETO**

## 📋 **URL FORNECIDA**
```
https://pensadoria-my.sharepoint.com/:x:/g/personal/amarberger_pensadoria_com_br/EWY3EZbI1NpAlUvdsRWFK1IB0ny3w-vqSSidFfkN5-zcGw?wdOrigin=TEAMS-WEB.p2p_ns.rwc&wdExp=TEAMS-TREATMENT&wdhostclicktime=1758124453904&web=1
```

## 🎯 **STATUS ATUAL**
- ✅ **Sistema implementado** com dados mockados
- ✅ **URL configurada** na API route
- ⏳ **Aguardando** configuração de autenticação
- 🧪 **Endpoint de teste** disponível

---

## 🧪 **TESTAR CONECTIVIDADE**

### **Teste Automático:**
```bash
curl http://localhost:3000/api/sharepoint/test
```

### **Teste Manual da API:**
```bash
curl http://localhost:3000/api/sharepoint/goals
```

---

## ⚙️ **OPÇÕES DE INTEGRAÇÃO**

### **🥇 OPÇÃO 1: Microsoft Graph API (Recomendado)**

#### **1.1 Registrar App no Azure AD:**
```
1. Acesse: https://portal.azure.com
2. Azure Active Directory → App registrations → New registration
3. Nome: "Decolagem Goals Integration"
4. Supported account types: Single tenant
5. Redirect URI: http://localhost:3000/api/auth/callback
```

#### **1.2 Configurar Permissões:**
```
API Permissions → Add permission → Microsoft Graph:
- Files.Read (Delegated)
- Sites.Read.All (Application)
```

#### **1.3 Variáveis de Ambiente:**
```bash
# .env.local
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret
AZURE_TENANT_ID=your_tenant_id
SHAREPOINT_SITE_ID=your_site_id
```

#### **1.4 Implementação:**
```typescript
// Substituir em app/api/sharepoint/goals/route.ts
const accessToken = await getAccessToken()
const graphUrl = `https://graph.microsoft.com/v1.0/sites/${siteId}/drive/items/${fileId}/workbook/worksheets('Sheet1')/usedRange`

const response = await fetch(graphUrl, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  }
})
```

---

### **🥈 OPÇÃO 2: SharePoint REST API**

#### **2.1 Configurar Autenticação:**
```typescript
const restUrl = `https://pensadoria.sharepoint.com/_api/web/lists/getbytitle('Goals')/items`
const response = await fetch(restUrl, {
  headers: {
    'Accept': 'application/json; odata=verbose',
    'Authorization': 'Bearer ' + accessToken
  }
})
```

---

### **🥉 OPÇÃO 3: CSV Export (Mais Simples)**

#### **3.1 Exportar Manualmente:**
```
1. Abrir planilha no SharePoint
2. File → Save As → Download a copy → CSV
3. Hospedar CSV em local público
4. Atualizar API para consumir CSV
```

#### **3.2 URL Pública do CSV:**
```typescript
// Se conseguir gerar URL pública
const csvUrl = 'https://pensadoria-my.sharepoint.com/personal/amarberger_pensadoria_com_br/Documents/goals.csv'
const response = await fetch(csvUrl)
const csvText = await response.text()
const data = parseCSV(csvText)
```

---

### **🏆 OPÇÃO 4: Webhook/Sync (Mais Robusto)**

#### **4.1 Configurar Webhook:**
```
1. SharePoint → List Settings → Workflow Settings
2. Create webhook para notificar mudanças
3. Sincronizar com banco local quando necessário
```

---

## 🔧 **IMPLEMENTAÇÃO RÁPIDA**

### **Para Testar Agora:**
```bash
# 1. Testar conectividade
curl http://localhost:3000/api/sharepoint/test

# 2. Ver dados mockados
curl http://localhost:3000/api/sharepoint/goals

# 3. Testar na interface
# Abrir família → Adicionar Meta → Ver recomendações
```

### **Para Produção:**
1. **Escolher uma das opções acima**
2. **Configurar autenticação**
3. **Substituir mockData na API**
4. **Testar com dados reais**

---

## 📊 **ESTRUTURA ESPERADA DOS DADOS**

### **Colunas do SharePoint:**
```
A: Dimensão (moradia, agua, saneamento...)
B: Pergunta (A família tem acesso...)
C: Meta (Instalar filtro...)
```

### **Formato JSON Processado:**
```json
{
  "goals": [
    {
      "id": "agua_1",
      "dimension": "agua", 
      "question": "A família tem acesso à água potável...",
      "goal": "Instalar um filtro ou caixa d'água...",
      "priority": "high"
    }
  ],
  "goals_by_dimension": {
    "agua": [...],
    "moradia": [...]
  }
}
```

---

## 🐛 **TROUBLESHOOTING**

### **Erro 401 - Unauthorized:**
```
Solução: Configurar autenticação (Graph API ou REST)
```

### **Erro 403 - Forbidden:**
```
Solução: Verificar permissões de compartilhamento
```

### **Erro 404 - Not Found:**
```
Solução: Verificar se URL está correta
```

### **Dados não aparecem na interface:**
```
1. Verificar console do navegador
2. Testar API: curl http://localhost:3000/api/sharepoint/goals
3. Verificar se família tem dignômetro com dimensões false
```

---

## 🎯 **PRÓXIMOS PASSOS**

### **Immediate (5 min):**
1. ✅ Testar endpoint: `/api/sharepoint/test`
2. ✅ Verificar dados mockados: `/api/sharepoint/goals`
3. ✅ Testar interface com família que tem `agua: false`

### **Short-term (1-2 horas):**
1. 🔧 Escolher opção de autenticação
2. 🔐 Configurar credenciais Azure/SharePoint
3. 🔄 Substituir mockData por dados reais
4. 🧪 Testar integração completa

### **Long-term (1 dia):**
1. 📊 Configurar webhook para sincronização automática
2. 🔄 Implementar cache para performance
3. 📝 Documentar processo para equipe
4. 🚀 Deploy em produção

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

- [ ] URL do SharePoint configurada
- [ ] Endpoint de teste funcionando
- [ ] Dados mockados retornando corretamente
- [ ] Interface mostrando recomendações
- [ ] Autenticação configurada (quando escolhida)
- [ ] Dados reais do SharePoint funcionando
- [ ] Performance otimizada
- [ ] Documentação atualizada

---

## 🆘 **SUPORTE**

Se encontrar problemas:

1. **Verificar logs:** Console do navegador + terminal
2. **Testar APIs:** Usar endpoints de teste primeiro
3. **Verificar permissões:** SharePoint pode restringir acesso
4. **Considerar alternativas:** CSV export pode ser mais simples

**Sistema já funciona 100% com dados mockados baseados nas suas imagens!**

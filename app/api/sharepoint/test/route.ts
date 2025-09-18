import { NextRequest, NextResponse } from 'next/server'

// Endpoint para testar conectividade com SharePoint
export async function GET(request: NextRequest) {
  const sharePointUrl = 'https://pensadoria-my.sharepoint.com/:x:/g/personal/amarberger_pensadoria_com_br/EWY3EZbI1NpAlUvdsRWFK1IB0ny3w-vqSSidFfkN5-zcGw?wdOrigin=TEAMS-WEB.p2p_ns.rwc&wdExp=TEAMS-TREATMENT&wdhostclicktime=1758124453904&web=1'
  
  const testResults = {
    sharepoint_url: sharePointUrl,
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  }

  // Teste 1: Conectividade básica
  try {
    console.log('🔗 Testando conectividade básica...')
    
    const response = await fetch(sharePointUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DecolagemApp/1.0)',
      }
    })
    
    testResults.tests.push({
      test: 'basic_connectivity',
      status: response.status,
      success: response.status < 400,
      message: response.status < 400 ? 'URL acessível' : 'URL requer autenticação',
      headers: Object.fromEntries(response.headers.entries())
    })
    
  } catch (error) {
    testResults.tests.push({
      test: 'basic_connectivity',
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    })
  }

  // Teste 2: Verificar se é arquivo Excel
  try {
    const isExcelFile = sharePointUrl.includes(':x:') || sharePointUrl.includes('.xlsx') || sharePointUrl.includes('.xls')
    
    testResults.tests.push({
      test: 'file_type_detection',
      success: isExcelFile,
      message: isExcelFile ? 'Detectado como arquivo Excel' : 'Não detectado como Excel',
      file_type: isExcelFile ? 'excel' : 'unknown'
    })
    
  } catch (error) {
    testResults.tests.push({
      test: 'file_type_detection',
      success: false,
      error: error instanceof Error ? error.message : 'Erro na detecção'
    })
  }

  // Teste 3: Tentar diferentes formatos de URL
  const urlVariations = [
    {
      name: 'original',
      url: sharePointUrl
    },
    {
      name: 'download_attempt',
      url: sharePointUrl.replace('/:x:/', '/:u:') + '&download=1'
    },
    {
      name: 'embed_attempt', 
      url: sharePointUrl.replace('/:x:/', '/:e:')
    }
  ]

  for (const variation of urlVariations) {
    try {
      const response = await fetch(variation.url, {
        method: 'HEAD',
        redirect: 'manual'
      })
      
      testResults.tests.push({
        test: `url_variation_${variation.name}`,
        url: variation.url,
        status: response.status,
        success: response.status < 400,
        redirect_location: response.headers.get('location')
      })
      
    } catch (error) {
      testResults.tests.push({
        test: `url_variation_${variation.name}`,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  }

  // Análise dos resultados
  const successfulTests = testResults.tests.filter(t => t.success).length
  const totalTests = testResults.tests.length
  
  const analysis = {
    overall_success: successfulTests > 0,
    success_rate: `${successfulTests}/${totalTests}`,
    recommendations: [] as string[]
  }

  // Recomendações baseadas nos testes
  if (testResults.tests.some(t => t.test === 'basic_connectivity' && t.status === 401)) {
    analysis.recommendations.push('Arquivo requer autenticação. Configure Microsoft Graph API.')
  }
  
  if (testResults.tests.some(t => t.test === 'basic_connectivity' && t.status === 403)) {
    analysis.recommendations.push('Acesso negado. Verifique permissões de compartilhamento.')
  }
  
  if (testResults.tests.some(t => t.test === 'basic_connectivity' && t.status === 200)) {
    analysis.recommendations.push('URL acessível! Pode tentar acesso direto.')
  }

  analysis.recommendations.push('Para integração completa, veja documentação em /docs/sharepoint-setup.md')

  return NextResponse.json({
    success: true,
    sharepoint_integration_test: {
      ...testResults,
      analysis
    },
    next_steps: [
      '1. Verificar se arquivo SharePoint é público ou requer autenticação',
      '2. Se requer auth: configurar Microsoft Graph API',  
      '3. Se público: tentar URLs de download direto',
      '4. Alternativamente: exportar como CSV e hospedar publicamente'
    ]
  })
}

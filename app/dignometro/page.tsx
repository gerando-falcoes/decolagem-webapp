"use client";

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

import { useDiagnostico } from './hooks/useDiagnostico'
import { useProgress } from './hooks/useProgress'
import { QuestionCard } from './components/QuestionCard'
import { ProgressBar } from './components/ProgressBar'
import { ResultCard } from './components/ResultCard'
import { DiagnosticoService } from '@/lib/diagnostico'
import { supabaseBrowserClient } from '@/lib/supabase/browser'

export default function DignometroPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = supabaseBrowserClient

  // Estados principais
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')

  // Hooks personalizados
  const { responses, updateResponse, getTotalAnswered, clearResponses } = useDiagnostico()
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    previousStep, 
    canGoNext, 
    canGoPrevious, 
    currentQuestion,
    resetProgress 
  } = useProgress()

  // Verificar autenticação e buscar familyId
  useEffect(() => {
    async function initializePage() {
      try {
        setIsLoading(true)

        // Verificar se foi passado familyId via URL (vindo do formulário de cadastro)
        const urlFamilyId = searchParams.get('familyId')
        if (urlFamilyId) {
          setFamilyId(urlFamilyId)
          setUserEmail('sistema@dignometro.com') // Email padrão para novos cadastros
          setIsLoading(false)
          return
        }

        // Verificar usuário autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          setAuthError('Usuário não autenticado. Faça login para continuar.')
          setIsLoading(false)
          return
        }

        setUserEmail(user.email || '')

        // Buscar família do mentor logado
        const { data: families, error: familiesError } = await supabase
          .from('families')
          .select('id, name')
          .eq('mentor_email', user.email)
          .limit(1)

        if (familiesError) {
          console.error('Erro ao buscar família:', familiesError)
          setAuthError('Erro ao buscar dados da família')
          setIsLoading(false)
          return
        }

        if (!families || families.length === 0) {
          setAuthError('Nenhuma família vinculada a este mentor')
          setIsLoading(false)
          return
        }

        setFamilyId(families[0].id)

      } catch (error) {
        console.error('Erro na inicialização:', error)
        setAuthError('Erro interno. Tente novamente.')
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [searchParams, supabase])

  // Função para calcular score
  const calculateScore = (responses: Record<string, boolean>): number => {
    return DiagnosticoService.calculateScore(responses)
  }

  // Função para obter nível de pobreza
  const getPovertyLevel = (score: number) => {
    return DiagnosticoService.getPovertyLevel(score)
  }

  // Função para submeter diagnóstico
  const handleSubmit = async () => {
    if (!familyId) {
      setAuthError('ID da família não encontrado')
      return
    }

    setIsSubmitting(true)

    try {
      const score = calculateScore(responses)
      
      const response = await fetch('/api/dignometro/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          familyId,
          responses,
          userEmail
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao submeter diagnóstico')
      }

      // Salvar resultado final
      DiagnosticoService.saveDiagnostico(familyId, userEmail, responses)
      
      setFinalScore(score)
      setIsCompleted(true)

      console.log('✅ Diagnóstico submetido com sucesso:', data)

    } catch (error) {
      console.error('❌ Erro ao submeter diagnóstico:', error)
      setAuthError(error instanceof Error ? error.message : 'Erro ao submeter diagnóstico')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para avançar (próxima pergunta ou submeter)
  const handleNext = () => {
    if (currentStep === totalSteps - 1) {
      // Última pergunta - submeter
      handleSubmit()
    } else {
      nextStep()
    }
  }

  // Função para voltar
  const handlePrevious = () => {
    previousStep()
  }

  // Função para recomeçar
  const handleRestart = () => {
    clearResponses()
    resetProgress()
    setIsCompleted(false)
    setFinalScore(0)
    setAuthError(null)
    
    // Recarregar página para garantir estado limpo
    window.location.reload()
  }

  // Função para ir ao dashboard
  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  // Verificar se a pergunta atual foi respondida
  const isCurrentQuestionAnswered = currentQuestion ? responses[currentQuestion.id] !== undefined : false

  // Renderização condicional
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="p-8">
            <CardContent className="flex items-center space-x-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-lg">Carregando Dignômetro...</span>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="p-8 max-w-md">
            <CardContent className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-900">Erro</h2>
              <p className="text-gray-600">{authError}</p>
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <ResultCard
            result={{ score: finalScore, responses }}
            onRestart={handleRestart}
            onGoToDashboard={handleGoToDashboard}
          />
        </div>
      </div>
    )
  }

  // Renderização principal do questionário
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Dignômetro</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Diagnóstico de pobreza multidimensional. Responda as perguntas para avaliar a situação da família.
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="max-w-2xl mx-auto">
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Pergunta atual */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            onAnswer={updateResponse}
            selectedValue={responses[currentQuestion.id]}
          />
        )}

        {/* Botões de navegação */}
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Button
            onClick={handlePrevious}
            disabled={!canGoPrevious || isSubmitting}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          <div className="text-sm text-gray-500">
            {getTotalAnswered()} de {totalSteps} respondidas
          </div>

          <Button
            onClick={handleNext}
            disabled={!isCurrentQuestionAnswered || isSubmitting}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : currentStep === totalSteps - 1 ? (
              <>
                <span>Finalizar</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Próxima</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

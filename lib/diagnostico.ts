import { v4 as uuidv4 } from 'uuid';
import { DiagnosticoQuestion, DiagnosticoResponse, PovertyLevel } from './types';

// 10 perguntas específicas do Dignômetro
export const diagnosticoQuestions: DiagnosticoQuestion[] = [
  {
    id: 'moradia',
    dimensao: 'Moradia',
    pergunta: 'A moradia tem CEP ou endereço digital, é segura, feita com alvenaria ou estrutura sólida, sem risco imediato de desabamento ou enchente?'
  },
  {
    id: 'agua',
    dimensao: 'Água',
    pergunta: 'A família tem acesso diário à água potável dentro de casa ou em local próximo, de forma segura e regular?'
  },
  {
    id: 'saneamento',
    dimensao: 'Saneamento',
    pergunta: 'A família possui acesso a banheiro sanitário adequado (com descarga e esgoto), de uso individual ou compartilhado com no máximo uma outra família?'
  },
  {
    id: 'educacao',
    dimensao: 'Educação',
    pergunta: 'As crianças da família (6 a 17 anos) estão matriculadas e frequentam a escola regularmente?'
  },
  {
    id: 'saude',
    dimensao: 'Saúde',
    pergunta: 'Se alguém ficou doente no último ano, a família conseguiu buscar atendimento médico adequado e acessar os remédios necessários?'
  },
  {
    id: 'alimentacao',
    dimensao: 'Alimentação',
    pergunta: 'Nos últimos 3 meses, todos os membros da família conseguiram fazer pelo menos duas refeições por dia, todos os dias.'
  },
  {
    id: 'renda_diversificada',
    dimensao: 'Renda Diversificada',
    pergunta: 'A família possui mais de uma fonte de renda ativa, como trabalho formal/informal, pensão, bicos ou pequenos negócios?'
  },
  {
    id: 'renda_estavel',
    dimensao: 'Renda Estável',
    pergunta: 'A responsável familiar conseguiu manter uma fonte de renda estável (formal ou informal) nos últimos 6 meses, sem interrupções longas?'
  },
  {
    id: 'poupanca',
    dimensao: 'Poupança',
    pergunta: 'A família tem poupança?'
  },
  {
    id: 'bens_conectividade',
    dimensao: 'Bens e Conectividade',
    pergunta: 'A família possui acesso à internet e conta com pelo menos três dos seguintes itens: geladeira, ventilador, máquina de lavar roupas ou tanquinho, fogão (a gás ou elétrico) ou televisão?'
  }
];

export class DiagnosticoService {
  private static readonly STORAGE_KEYS = {
    RESPONSES: 'diagnostico_responses',
    FINAL: 'diagnostico_final',
    CURRENT_STEP: 'diagnostico_current_step'
  };

  static saveResponse(questionId: string, answer: boolean): void {
    if (typeof window === 'undefined') return;
    
    const current = this.loadResponses();
    const updated = { ...current, [questionId]: answer };
    
    localStorage.setItem(this.STORAGE_KEYS.RESPONSES, JSON.stringify(updated));
  }

  static loadResponses(): Record<string, boolean> {
    if (typeof window === 'undefined') return {};
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.RESPONSES);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  static calculateScore(responses: Record<string, boolean>): number {
    const totalQuestions = Object.keys(responses).length;
    if (totalQuestions === 0) return 0;
    
    const positiveResponses = Object.values(responses).filter(Boolean).length;
    return (positiveResponses / totalQuestions) * 10;
  }

  static getPovertyLevel(score: number): PovertyLevel {
    if (score >= 8.0) return "quebra de ciclo da pobreza";
    if (score >= 6.0) return "prosperidade em desenvolvimento";
    if (score >= 4.0) return "dignidade";
    if (score >= 2.0) return "pobreza";
    return "pobreza extrema";
  }

  static saveDiagnostico(
    familyId: string,
    userEmail: string,
    responses: Record<string, boolean>
  ): DiagnosticoResponse {
    const score = this.calculateScore(responses);
    
    const diagnostico: DiagnosticoResponse = {
      id: uuidv4(),
      userId: uuidv4(), // ou usar o ID do usuário logado
      userEmail,
      familyId,
      responses,
      score,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEYS.FINAL, JSON.stringify(diagnostico));
      localStorage.removeItem(this.STORAGE_KEYS.RESPONSES);
      localStorage.removeItem(this.STORAGE_KEYS.CURRENT_STEP);
    }

    return diagnostico;
  }

  static clearAll(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.STORAGE_KEYS.RESPONSES);
    localStorage.removeItem(this.STORAGE_KEYS.FINAL);
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_STEP);
  }

  static saveCurrentStep(step: number): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_STEP, step.toString());
  }

  static loadCurrentStep(): number {
    if (typeof window === 'undefined') return 0;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CURRENT_STEP);
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  }
}

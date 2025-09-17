"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { X, Plus, Edit2, Trash2, MessageSquare, Calendar, Users, Briefcase, Heart, Home, FileText, Utensils } from "lucide-react"

// Mock Data as per the plan
const suggestedMetasMock = [
  {
    id: "1",
    title: "Reforma do Banheiro",
    description: "Melhorar condições de saneamento básico",
    dimension: "moradia",
    priority: "alta",
    suggestedDeadline: new Date("2024-12-31"),
    suggestedResponsible: "familia",
  },
  {
    id: "2",
    title: "Curso Profissionalizante para João",
    description: "Capacitação para aumentar a renda familiar",
    dimension: "renda",
    priority: "media",
    suggestedDeadline: new Date("2024-10-15"),
    suggestedResponsible: "mentora",
  },
  {
    id: "3",
    title: "Acompanhamento Médico Regular",
    description: "Garantir check-ups de saúde para todos os membros",
    dimension: "saude",
    priority: "alta",
    suggestedDeadline: new Date("2024-09-30"),
    suggestedResponsible: "familia",
  },
];

const dimensionConfig = {
    moradia: { icon: <Home className="w-4 h-4" />, label: "Moradia", color: "bg-blue-100 text-blue-800" },
    saude: { icon: <Heart className="w-4 h-4" />, label: "Saúde", color: "bg-red-100 text-red-800" },
    renda: { icon: <Briefcase className="w-4 h-4" />, label: "Renda", color: "bg-green-100 text-green-800" },
    educacao: { icon: <FileText className="w-4 h-4" />, label: "Educação", color: "bg-yellow-100 text-yellow-800" },
    alimentacao: { icon: <Utensils className="w-4 h-4" />, label: "Alimentação", color: "bg-orange-100 text-orange-800" },
    documentacao: { icon: <FileText className="w-4 h-4" />, label: "Documentação", color: "bg-purple-100 text-purple-800" },
};

const DimensionBadge = ({ dimension }) => {
    const config = dimensionConfig[dimension] || {};
    return <Badge className={`${config.color} flex items-center gap-1`}>{config.icon}{config.label}</Badge>;
};

const PriorityBadge = ({ priority }) => {
    const config = {
        alta: { label: "🔥 Alta Prioridade", className: "bg-red-100 text-red-800" },
        media: { label: "🟡 Média Prioridade", className: "bg-yellow-100 text-yellow-800" },
        baixa: { label: "🟢 Baixa Prioridade", className: "bg-green-100 text-green-800" },
    }[priority];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
};

const generateNotificationPreview = (meta, familyName = "Família Silva") => {
    if (!meta.title && !meta.description) return "Preencha a descrição para ver o preview.";
    const metaTitle = meta.title || meta.description;
    const deadline = meta.suggestedDeadline || meta.deadline;
    const formattedDate = deadline ? new Intl.DateTimeFormat('pt-BR').format(deadline) : "[Data não definida]";
    return `Olá ${familyName}! Sua meta '${metaTitle}' tem prazo até ${formattedDate}. Vamos conquistar juntos! 🚀`;
};

const SuggestedMetaCard = ({ meta, isSelected, onToggle }) => {
    const notificationPreview = generateNotificationPreview(meta);

    return (
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <Card className={`transition-all duration-300 border-2 ${isSelected ? "border-green-500 bg-green-50/50" : "border-gray-200"}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Checkbox checked={isSelected} onCheckedChange={onToggle} className="mt-1" />
                            <div>
                                <CardTitle className="text-base font-semibold text-gray-800">{meta.title}</CardTitle>
                                <p className="text-sm text-gray-500 mt-1">{meta.description}</p>
                            </div>
                        </div>
                        <DimensionBadge dimension={meta.dimension} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-sm">
                        <PriorityBadge priority={meta.priority} />
                        <Badge variant="outline"><Calendar className="w-3 h-3 mr-1.5" /> {new Intl.DateTimeFormat('pt-BR').format(meta.suggestedDeadline)}</Badge>
                        <Badge variant="outline"><Users className="w-3 h-3 mr-1.5" /> {meta.suggestedResponsible === 'familia' ? "Família" : "Mentora"}</Badge>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="text-sm font-medium text-blue-800 mb-2 flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Preview da Notificação:</p>
                        <p className="text-sm text-blue-700 italic">"{notificationPreview}"</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Button variant="ghost" size="sm" className="text-gray-600"><Edit2 className="w-3 h-3 mr-1" /> Editar</Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600"><Trash2 className="w-3 h-3 mr-1" /> Descartar</Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const CustomMetaSection = () => {
    const [customMeta, setCustomMeta] = useState({ description: "", dimension: "", priority: "media", deadline: null, responsible: "" });
    const notificationPreview = generateNotificationPreview(customMeta);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-1">
            <Card className="border-gray-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800"><Plus className="w-5 h-5 text-green-500" /> Criar Meta Personalizada</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="description">Descrição da Meta *</Label>
                        <Textarea id="description" placeholder="Ex: Concluir curso de informática básica" className="mt-2" rows={3} onChange={e => setCustomMeta({...customMeta, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="dimension">Dimensão *</Label>
                            <Select onValueChange={value => setCustomMeta({...customMeta, dimension: value})}>
                                <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione a dimensão" /></SelectTrigger>
                                <SelectContent>
                                    {Object.entries(dimensionConfig).map(([key, { label, icon }]) => (
                                        <SelectItem key={key} value={key}><div className="flex items-center gap-2">{icon} {label}</div></SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Prioridade *</Label>
                            <RadioGroup defaultValue="media" className="flex gap-4 mt-2" onValueChange={value => setCustomMeta({...customMeta, priority: value})}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="alta" id="alta" /><Label htmlFor="alta">🔥 Alta</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="media" id="media" /><Label htmlFor="media">🟡 Média</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="baixa" id="baixa" /><Label htmlFor="baixa">🟢 Baixa</Label></div>
                            </RadioGroup>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="deadline">Prazo *</Label>
                            {/* DatePicker would be integrated here */}
                            <Input type="date" className="mt-2" onChange={e => setCustomMeta({...customMeta, deadline: new Date(e.target.value)})} />
                        </div>
                        <div>
                            <Label htmlFor="responsible">Responsável *</Label>
                            <Select onValueChange={value => setCustomMeta({...customMeta, responsible: value})}>
                                <SelectTrigger className="mt-2"><SelectValue placeholder="Quem será responsável?" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="familia"><div className="flex items-center gap-2"><Users className="w-4 h-4"/> Família</div></SelectItem>
                                    <SelectItem value="mentora"><div className="flex items-center gap-2"><Users className="w-4 h-4"/> Mentora</div></SelectItem>
                                    <SelectItem value="ambos"><div className="flex items-center gap-2"><Users className="w-4 h-4"/> Família e Mentora</div></SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Preview da Notificação:</h4>
                        <div className="bg-white p-3 rounded border border-blue-200/50">
                            <p className="text-sm text-gray-700 italic">"{notificationPreview}"</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export function MetaModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('suggested');
    const [selectedMetas, setSelectedMetas] = useState(new Set());

    const handleToggleMeta = (metaId) => {
        setSelectedMetas(prev => {
            const newSet = new Set(prev);
            if (newSet.has(metaId)) {
                newSet.delete(metaId);
            } else {
                newSet.add(metaId);
            }
            return newSet;
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b">
                    <DialogTitle className="text-xl font-bold text-gray-800">Adicionar Meta</DialogTitle>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}><X className="w-5 h-5" /></Button>
                </DialogHeader>

                <div className="border-b">
                    <div className="px-6 flex gap-1">
                        <TabButton id="suggested" activeTab={activeTab} setActiveTab={setActiveTab}>📋 Metas Sugeridas</TabButton>
                        <TabButton id="manual" activeTab={activeTab} setActiveTab={setActiveTab}>➕ Nova Meta Manual</TabButton>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {activeTab === 'suggested' ? (
                        <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }} initial="hidden" animate="visible" className="space-y-4">
                            <p className="text-sm text-gray-600">🤖 Metas sugeridas automaticamente com base no perfil e avaliações da família.</p>
                            {suggestedMetasMock.map(meta => (
                                <SuggestedMetaCard key={meta.id} meta={meta} isSelected={selectedMetas.has(meta.id)} onToggle={() => handleToggleMeta(meta.id)} />
                            ))}
                        </motion.div>
                    ) : (
                        <CustomMetaSection />
                    )}
                </div>

                <DialogFooter className="p-6 bg-white border-t flex justify-between items-center">
                    {activeTab === 'suggested' ? (
                        <Button disabled={selectedMetas.size === 0} className="bg-green-600 hover:bg-green-500 text-white hover:text-white shadow-sm hover:shadow-md transition-all duration-200">
                            <Plus className="w-4 h-4 mr-2" /> Adicionar {selectedMetas.size > 0 ? `${selectedMetas.size} Metas Selecionadas` : 'Metas'}
                        </Button>
                    ) : (
                        <Button className="bg-green-600 hover:bg-green-500 text-white hover:text-white shadow-sm hover:shadow-md transition-all duration-200">
                            <Plus className="w-4 h-4 mr-2" /> Adicionar Meta Personalizada
                        </Button>
                    )}
                    <Button variant="outline" onClick={onClose}>Fechar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const TabButton = ({ id, activeTab, setActiveTab, children }) => (
    <button
        onClick={() => setActiveTab(id)}
        className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors duration-200 relative -bottom-px border-b-2 ${activeTab === id ? 'text-blue-600 border-blue-600' : 'text-gray-500 hover:text-gray-800 border-transparent'}`}>
        {children}
    </button>
);

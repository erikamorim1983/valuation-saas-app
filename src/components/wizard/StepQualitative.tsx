import { useWizard } from './WizardContext';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { NumericFormat } from 'react-number-format';

const schema = z.object({
    // Pillar 1: Ops
    hasSOPs: z.enum(['full', 'partial', 'none']),
    ownerAutonomyScore: z.number().min(0).max(100),
    teamScore: z.number().min(0).max(10),

    // Pillar 2: Recurrency
    recurringRevenuePercent: z.number().min(0).max(100),

    // Pillar 3: Concentration
    biggestClientPercent: z.number().min(0).max(100),

    // Pillar 4: Risk
    hasAuditedDocs: z.boolean(),
    hasInsurance: z.boolean(),
    hasLegalIssues: z.boolean(),
    hasERP: z.boolean(),
    hasIntegratedPayments: z.boolean(),
    hasPaymentWorkflow: z.boolean(),
    hasAutoReconciliation: z.boolean(),
    hasFinancialPlan: z.boolean()
});

type FormData = z.infer<typeof schema>;

// 5-Level Scales Helper Data
const autonomyLevels = [
    { value: 0, label: "Totalmente Dependente", description: "O negócio para sem o dono." },
    { value: 25, label: "Alta Dependência", description: "O dono centraliza decisões." },
    { value: 50, label: "Parcialmente", description: "Gerentes tocam o dia-a-dia." },
    { value: 75, label: "Baixa Dependência", description: "Apenas estratégico com o dono." },
    { value: 100, label: "Totalmente Autônomo", description: "Roda 100% sem o funddor." }
];

const teamLevels = [
    { value: 2, label: "Amador", description: "Informal, pouco qualificado." },
    { value: 4, label: "Iniciante", description: "Esforçado, mas baixa técnica." },
    { value: 6, label: "Profissional", description: "Boa entrega técnica." },
    { value: 8, label: "Alto Desempenho", description: "Proativo e autogerenciável." },
    { value: 10, label: "Classe Mundial", description: "Referência no mercado." }
];

export default function StepQualitative() {
    const { data, updateData, setStep, saveDraft, isSaving } = useWizard();
    const t = useTranslations('Wizard');

    const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            hasSOPs: data.qualitative?.hasSOPs || 'none',
            ownerAutonomyScore: data.qualitative?.ownerAutonomyScore || 0,
            teamScore: data.qualitative?.teamScore || 5, // Default mid
            recurringRevenuePercent: data.qualitative?.recurringRevenuePercent || 0,
            biggestClientPercent: data.qualitative?.biggestClientPercent || 0,
            hasAuditedDocs: data.qualitative?.hasAuditedDocs || false,
            hasInsurance: data.qualitative?.hasInsurance || false,
            hasLegalIssues: data.qualitative?.hasLegalIssues || false,
            hasERP: data.qualitative?.hasERP || false,
            hasIntegratedPayments: data.qualitative?.hasIntegratedPayments || false,
            hasPaymentWorkflow: data.qualitative?.hasPaymentWorkflow || false,
            hasAutoReconciliation: data.qualitative?.hasAutoReconciliation || false,
            hasFinancialPlan: data.qualitative?.hasFinancialPlan || false
        }
    });

    const onSubmit = (formData: FormData) => {
        updateData({ qualitative: formData });
        setStep('review');
    };

    const currentAutonomy = watch('ownerAutonomyScore');
    const currentTeam = watch('teamScore');

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Análise Qualitativa (5 Pilares)
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Responda com honestidade para calibrar o múltiplo de valuation.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* 1. OPERATIONS & AUTONOMY */}
                <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-zinc-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">1. Operações & Autonomia</h3>

                    {/* SOPs */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Você possui Manuais de Operação (SOPs) documentados?
                        </label>
                        <div className="space-y-2">
                            {['full', 'partial', 'none'].map((opt) => (
                                <div key={opt} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`sop-${opt}`}
                                        value={opt}
                                        {...register('hasSOPs')}
                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`sop-${opt}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {opt === 'full' && 'Sim, completos e atualizados'}
                                        {opt === 'partial' && 'Parcialmente / Informal'}
                                        {opt === 'none' && 'Não / Tudo na cabeça'}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Autonomy Scale */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Qual % da operação roda sem a presença do fundador?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                            {autonomyLevels.map((level) => (
                                <div
                                    key={level.value}
                                    onClick={() => setValue('ownerAutonomyScore', level.value)}
                                    className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center justify-center text-center transition-all ${currentAutonomy === level.value
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                        : 'border-gray-200 dark:border-zinc-700 hover:border-blue-300'
                                        }`}
                                >
                                    <span className={`text-sm font-bold ${currentAutonomy === level.value ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                                        {level.label}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">{level.description}</span>
                                </div>
                            ))}
                        </div>
                        <input type="hidden" {...register('ownerAutonomyScore')} />
                    </div>

                    {/* Team Scale */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nível de Qualidade do Time
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                            {teamLevels.map((level) => (
                                <div
                                    key={level.value}
                                    onClick={() => setValue('teamScore', level.value)}
                                    className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center justify-center text-center transition-all ${currentTeam === level.value
                                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500'
                                        : 'border-gray-200 dark:border-zinc-700 hover:border-green-300'
                                        }`}
                                >
                                    <span className={`text-sm font-bold ${currentTeam === level.value ? 'text-green-700 dark:text-green-300' : 'text-gray-900 dark:text-white'}`}>
                                        {level.label}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1">{level.description}</span>
                                </div>
                            ))}
                        </div>
                        <input type="hidden" {...register('teamScore')} />
                    </div>
                </div>

                {/* 2. RECURAVIDADE & CONCENTRAÇÃO */}
                <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-zinc-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">2. Receita & Clientes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                % Receita Recorrente (Contratos Longos)
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Considerar apenas contratos &gt; 12 meses garantidos.</p>
                            <div className="relative rounded-md shadow-sm">
                                <NumericFormat
                                    value={watch('recurringRevenuePercent')}
                                    decimalScale={0}
                                    fixedDecimalScale={false}
                                    suffix="%"
                                    isAllowed={(values) => {
                                        const { floatValue } = values;
                                        return floatValue === undefined || (floatValue >= 0 && floatValue <= 100);
                                    }}
                                    onValueChange={(v) => setValue('recurringRevenuePercent', v.floatValue ?? 0)}
                                    className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                % Receita do Maior Cliente (Concentração)
                            </label>
                            <p className="text-xs text-gray-500 mb-2">Quanto sua receita depende de um único cliente?</p>
                            <div className="relative rounded-md shadow-sm">
                                <NumericFormat
                                    value={watch('biggestClientPercent')}
                                    decimalScale={0}
                                    suffix="%"
                                    isAllowed={(values) => {
                                        const { floatValue } = values;
                                        return floatValue === undefined || (floatValue >= 0 && floatValue <= 100);
                                    }}
                                    onValueChange={(v) => setValue('biggestClientPercent', v.floatValue ?? 0)}
                                    className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700 sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. RISK & COMPLIANCE */}
                <div className="bg-white dark:bg-zinc-900 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-zinc-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">3. Risco & Compliance</h3>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <input id="audited" type="checkbox" {...register('hasAuditedDocs')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 mt-1" />
                            <label htmlFor="audited" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                Possuo demonstrações financeiras (DRE/Balanço) organizadas?
                            </label>
                        </div>
                        <div className="flex items-start">
                            <input id="erp" type="checkbox" {...register('hasERP')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 mt-1" />
                            <label htmlFor="erp" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                Utilizo ERP especializado para meu segmento
                            </label>
                        </div>
                        <div className="flex items-start">
                            <input id="finplan" type="checkbox" {...register('hasFinancialPlan')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 mt-1" />
                            <label htmlFor="finplan" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                Plano financeiro e centros de custo organizados e claros
                            </label>
                        </div>
                        <div className="flex items-start">
                            <input id="integ-pay" type="checkbox" {...register('hasIntegratedPayments')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 mt-1" />
                            <label htmlFor="integ-pay" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                Sistema de pagamentos integrado com o Banco (Conciliação Auto)
                            </label>
                        </div>
                        <div className="flex items-start">
                            <input id="insurance" type="checkbox" {...register('hasInsurance')} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 mt-1" />
                            <label htmlFor="insurance" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                Possuo Seguros Empresariais adequados (RC, Cyber, etc)?
                            </label>
                        </div>
                        <div className="flex items-start">
                            <input id="legal" type="checkbox" {...register('hasLegalIssues')} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600 mt-1" />
                            <label htmlFor="legal" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                                A empresa possui processos jurídicos ou passivos trabalhistas relevantes?
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={() => setStep('financials')}>
                        {t('buttons.back')}
                    </Button>
                    <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={saveDraft} disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                        </Button>
                        <Button type="submit">
                            {t('buttons.next')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-zinc-800 pb-2">{title}</h3>
            {children}
        </div>
    );
}

function RadioOption({ label, value, register, name }: any) {
    return (
        <div className="flex items-center">
            <input
                id={`${name}-${value}`}
                type="radio"
                value={value}
                {...register(name)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
            />
            <label htmlFor={`${name}-${value}`} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
        </div>
    );
}

function Checkbox({ label, name, register }: any) {
    return (
        <div className="flex items-start">
            <div className="flex items-center h-5">
                <input
                    id={name}
                    type="checkbox"
                    {...register(name)}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor={name} className="font-medium text-gray-700 dark:text-gray-300">{label}</label>
            </div>
        </div>
    );
}

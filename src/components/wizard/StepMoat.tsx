'use client';

import { useWizard } from './WizardContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';

const schema = z.object({
    hasPatents: z.boolean().optional(),
    hasTradeSecrets: z.boolean().optional(),
    hasProprietaryTech: z.boolean().optional(),
    networkEffects: z.enum(['none', 'weak', 'strong']).optional(),
    switchingCosts: z.enum(['low', 'medium', 'high']).optional(),
    soc2: z.boolean().optional(),
    iso27001: z.boolean().optional(),
    hipaa: z.boolean().optional(),
    pciDss: z.boolean().optional()
});

type FormData = z.infer<typeof schema>;

export default function StepMoat() {
    const { data, updateData, setStep, saveDraft, isSaving } = useWizard();

    const { register, handleSubmit, watch } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            hasPatents: data.moat?.hasPatents || false,
            hasTradeSecrets: data.moat?.hasTradeSecrets || false,
            hasProprietaryTech: data.moat?.hasProprietaryTech || false,
            networkEffects: data.moat?.networkEffects || 'none',
            switchingCosts: data.moat?.switchingCosts || 'low',
            soc2: data.moat?.certifications?.soc2 || false,
            iso27001: data.moat?.certifications?.iso27001 || false,
            hipaa: data.moat?.certifications?.hipaa || false,
            pciDss: data.moat?.certifications?.pciDss || false
        }
    });

    const watchedValues = watch();

    const onSubmit = (formData: FormData) => {
        updateData({
            moat: {
                hasPatents: formData.hasPatents,
                hasTradeSecrets: formData.hasTradeSecrets,
                hasProprietaryTech: formData.hasProprietaryTech,
                networkEffects: formData.networkEffects,
                switchingCosts: formData.switchingCosts,
                certifications: {
                    soc2: formData.soc2,
                    iso27001: formData.iso27001,
                    hipaa: formData.hipaa,
                    pciDss: formData.pciDss
                }
            }
        });
        setStep('review');
    };

    const handleBack = () => {
        setStep('qualitative');
    };

    // Calculate moat strength
    const calculateMoatScore = () => {
        let score = 0;
        if (watchedValues.hasPatents) score += 20;
        if (watchedValues.hasTradeSecrets) score += 15;
        if (watchedValues.hasProprietaryTech) score += 15;
        if (watchedValues.networkEffects === 'strong') score += 20;
        else if (watchedValues.networkEffects === 'weak') score += 10;
        if (watchedValues.switchingCosts === 'high') score += 15;
        else if (watchedValues.switchingCosts === 'medium') score += 8;
        
        const certCount = [
            watchedValues.soc2,
            watchedValues.iso27001,
            watchedValues.hipaa,
            watchedValues.pciDss
        ].filter(Boolean).length;
        score += certCount * 5;

        return Math.min(score, 100);
    };

    const moatScore = calculateMoatScore();
    const getMoatRating = (score: number) => {
        if (score >= 70) return { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' };
        if (score >= 50) return { label: 'Forte', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' };
        if (score >= 30) return { label: 'Moderado', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/20' };
        return { label: 'Fraco', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' };
    };

    const moatRating = getMoatRating(moatScore);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Moat & Defensibilidade
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Barreiras competitivas que protegem seu negócio e aumentam o valuation
                </p>
            </div>

            {/* Moat Score Card */}
            <div className={`${moatRating.bg} rounded-lg border border-gray-200 dark:border-zinc-700 p-6`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Score de Moat
                        </h3>
                        <p className={`text-3xl font-bold ${moatRating.color} mt-1`}>
                            {moatScore}/100
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${moatRating.color} ${moatRating.bg}`}>
                            {moatRating.label}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Impacto no valuation: +{(moatScore * 0.15).toFixed(0)}%
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Intellectual Property */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Propriedade Intelectual
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Proteção legal da tecnologia e processos
                    </p>

                    <div className="space-y-4">
                        <label className="flex items-start">
                            <input
                                type="checkbox"
                                {...register('hasPatents')}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Patentes</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Patentes concedidas ou pendentes (+20pts)
                                </div>
                            </div>
                        </label>

                        <label className="flex items-start">
                            <input
                                type="checkbox"
                                {...register('hasTradeSecrets')}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Trade Secrets</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Segredos comerciais documentados e protegidos (+15pts)
                                </div>
                            </div>
                        </label>

                        <label className="flex items-start">
                            <input
                                type="checkbox"
                                {...register('hasProprietaryTech')}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Tecnologia Proprietária</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Algoritmos, frameworks ou processos únicos (+15pts)
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Network Effects */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Efeitos de Rede
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        O produto fica mais valioso com mais usuários?
                    </p>

                    <div className="space-y-3">
                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                            <input
                                type="radio"
                                {...register('networkEffects')}
                                value="none"
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Nenhum</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Não há efeito de rede</div>
                            </div>
                        </label>

                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                            <input
                                type="radio"
                                {...register('networkEffects')}
                                value="weak"
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Fraco (+10pts)</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Algum benefício indireto com mais usuários</div>
                            </div>
                        </label>

                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                            <input
                                type="radio"
                                {...register('networkEffects')}
                                value="strong"
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Forte (+20pts)</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Valor cresce exponencialmente (ex: marketplace, social)
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Switching Costs */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Custo de Troca (Switching Cost)
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Quão difícil é para o cliente trocar de fornecedor?
                    </p>

                    <div className="space-y-3">
                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                            <input
                                type="radio"
                                {...register('switchingCosts')}
                                value="low"
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Baixo</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Cliente pode sair facilmente</div>
                            </div>
                        </label>

                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                            <input
                                type="radio"
                                {...register('switchingCosts')}
                                value="medium"
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Médio (+8pts)</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Alguma integração, migração de dados necessária
                                </div>
                            </div>
                        </label>

                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800">
                            <input
                                type="radio"
                                {...register('switchingCosts')}
                                value="high"
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Alto (+15pts)</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Integração profunda, alto custo de saída
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Certifications */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Certificações & Compliance
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Certificações que criam barreiras de entrada (+5pts cada)
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-start p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('soc2')}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">SOC 2 Type II</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Segurança de dados</div>
                            </div>
                        </label>

                        <label className="flex items-start p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('iso27001')}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">ISO 27001</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Gestão de segurança</div>
                            </div>
                        </label>

                        <label className="flex items-start p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('hipaa')}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">HIPAA</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Saúde (EUA)</div>
                            </div>
                        </label>

                        <label className="flex items-start p-3 border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('pciDss')}
                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">PCI-DSS</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Pagamentos</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between pt-4">
                    <div className="space-x-3">
                        <Button type="button" variant="outline" onClick={handleBack}>
                            Voltar
                        </Button>
                        <Button type="button" variant="outline" onClick={saveDraft} disabled={isSaving}>
                            {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                        </Button>
                    </div>
                    <Button type="submit">
                        Revisar & Calcular
                    </Button>
                </div>
            </form>
        </div>
    );
}

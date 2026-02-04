'use client';

import { useWizard } from './WizardContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

const schema = z.object({
    churnRate: z.number().min(0).max(30).optional(),
    nrr: z.number().min(80).max(150).optional(),
    ltvCacRatio: z.number().min(1).max(10).optional(),
    contractType: z.enum(['monthly', 'annual', 'multi-year']).optional()
});

type FormData = z.infer<typeof schema>;

export default function StepRevenueQuality() {
    const { data, updateData, setStep, saveDraft, isSaving } = useWizard();
    
    const [churnValue, setChurnValue] = useState(data.revenueQuality?.churnRate || 15);
    const [nrrValue, setNrrValue] = useState(data.revenueQuality?.nrr || 100);
    const [ltvCacValue, setLtvCacValue] = useState(data.revenueQuality?.ltvCacRatio || 3);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            churnRate: data.revenueQuality?.churnRate,
            nrr: data.revenueQuality?.nrr,
            ltvCacRatio: data.revenueQuality?.ltvCacRatio,
            contractType: data.revenueQuality?.contractType
        }
    });

    const onSubmit = (formData: FormData) => {
        updateData({
            revenueQuality: {
                churnRate: formData.churnRate,
                nrr: formData.nrr,
                ltvCacRatio: formData.ltvCacRatio,
                contractType: formData.contractType
            }
        });
        setStep('qualitative');
    };

    const handleBack = () => {
        setStep('financials');
    };

    // Helper to determine quality rating
    const getChurnQuality = (churn?: number) => {
        if (!churn) return { label: '-', color: 'text-gray-400' };
        if (churn <= 5) return { label: 'Excelente', color: 'text-green-600' };
        if (churn <= 10) return { label: 'Bom', color: 'text-blue-600' };
        if (churn <= 15) return { label: 'Médio', color: 'text-yellow-600' };
        return { label: 'Alto', color: 'text-red-600' };
    };

    const getNrrQuality = (nrr?: number) => {
        if (!nrr) return { label: '-', color: 'text-gray-400' };
        if (nrr >= 120) return { label: 'Excelente', color: 'text-green-600' };
        if (nrr >= 110) return { label: 'Muito Bom', color: 'text-blue-600' };
        if (nrr >= 100) return { label: 'Bom', color: 'text-yellow-600' };
        return { label: 'Atenção', color: 'text-red-600' };
    };

    const getLtvCacQuality = (ratio?: number) => {
        if (!ratio) return { label: '-', color: 'text-gray-400' };
        if (ratio >= 5) return { label: 'Excelente', color: 'text-green-600' };
        if (ratio >= 3) return { label: 'Bom', color: 'text-blue-600' };
        if (ratio >= 2) return { label: 'Médio', color: 'text-yellow-600' };
        return { label: 'Baixo', color: 'text-red-600' };
    };

    const churnQuality = getChurnQuality(churnValue);
    const nrrQuality = getNrrQuality(nrrValue);
    const ltvCacQuality = getLtvCacQuality(ltvCacValue);

    // Check if sector is SaaS/Fintech (relevant for these metrics)
    const isSaasRelevant = ['SaaS', 'Fintech'].includes(data.sector);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Qualidade da Receita
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {isSaasRelevant 
                        ? 'Métricas SaaS que impactam significativamente o valuation'
                        : 'Estas métricas são opcionais para seu setor, mas podem melhorar a precisão'}
                </p>
            </div>

            {!isSaasRelevant && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 dark:bg-blue-900/20">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                💡 <strong>Dica:</strong> Seu setor ({data.sector}) normalmente não usa essas métricas. 
                                Você pode pular esta etapa clicando em "Próximo" abaixo.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Churn Rate */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Taxa de Churn Mensal
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Percentual de clientes que cancelam por mês
                            </p>
                        </div>
                        <span className={`text-2xl font-bold ${churnQuality.color}`}>
                            {churnValue.toFixed(1)}%
                        </span>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="30"
                        step="0.5"
                        value={churnValue}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setChurnValue(val);
                            setValue('churnRate', val);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>0% (Perfeito)</span>
                        <span className={churnQuality.color}>{churnQuality.label}</span>
                        <span>30% (Alto)</span>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded text-xs text-gray-600 dark:text-gray-400">
                        <strong>Benchmark:</strong> SaaS B2B: 3-7% | SaaS SMB: 5-10% | Consumer: 10-15%
                    </div>
                </div>

                {/* Net Revenue Retention (NRR) */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Net Revenue Retention (NRR)
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Receita retida + expansão da base existente
                            </p>
                        </div>
                        <span className={`text-2xl font-bold ${nrrQuality.color}`}>
                            {nrrValue}%
                        </span>
                    </div>

                    <input
                        type="range"
                        min="80"
                        max="150"
                        step="1"
                        value={nrrValue}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setNrrValue(val);
                            setValue('nrr', val);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>80% (Atenção)</span>
                        <span className={nrrQuality.color}>{nrrQuality.label}</span>
                        <span>150% (World-class)</span>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded text-xs text-gray-600 dark:text-gray-400">
                        <strong>Benchmark:</strong> {'>'} 120% = Excelente | 110-120% = Muito bom | 100-110% = Bom | {'<'} 100% = Churn líquido
                    </div>
                </div>

                {/* LTV/CAC Ratio */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                LTV / CAC Ratio
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Lifetime Value dividido por Customer Acquisition Cost
                            </p>
                        </div>
                        <span className={`text-2xl font-bold ${ltvCacQuality.color}`}>
                            {ltvCacValue.toFixed(1)}x
                        </span>
                    </div>

                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.1"
                        value={ltvCacValue}
                        onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setLtvCacValue(val);
                            setValue('ltvCacRatio', val);
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>1x (Ruim)</span>
                        <span className={ltvCacQuality.color}>{ltvCacQuality.label}</span>
                        <span>10x (Excelente)</span>
                    </div>

                    <div className="mt-4 p-3 bg-gray-50 dark:bg-zinc-800 rounded text-xs text-gray-600 dark:text-gray-400">
                        <strong>Benchmark:</strong> &gt;5x = Excelente | 3-5x = Bom | 2-3x = Médio | &lt;2x = Atenção
                    </div>
                </div>

                {/* Contract Type */}
                <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Tipo de Contrato Predominante
                    </h3>
                    
                    <div className="space-y-3">
                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <input
                                type="radio"
                                {...register('contractType')}
                                value="monthly"
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Mensal</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Flexível, mas menor previsibilidade
                                </div>
                            </div>
                        </label>

                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <input
                                type="radio"
                                {...register('contractType')}
                                value="annual"
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Anual</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Boa previsibilidade, padrão SaaS
                                </div>
                            </div>
                        </label>

                        <label className="flex items-center p-4 border-2 border-gray-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                            <input
                                type="radio"
                                {...register('contractType')}
                                value="multi-year"
                                className="w-4 h-4 text-blue-600"
                            />
                            <div className="ml-3">
                                <div className="font-medium text-gray-900 dark:text-white">Multi-ano (2-5 anos)</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Máxima previsibilidade, aumenta valuation
                                </div>
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
                        Próximo
                    </Button>
                </div>
            </form>
        </div>
    );
}

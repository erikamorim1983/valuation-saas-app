'use client';

import { ValuationRecord } from '@/lib/supabase/valuation';
import { useValuationSimulator } from '@/hooks/useValuationSimulator';
import { NumericFormat } from 'react-number-format';

interface Props {
    valuation: ValuationRecord;
}

export function ValuationSimulator({ valuation }: Props) {
    const { baseline, simulation, params, setParam } = useValuationSimulator(valuation);

    if (!simulation) return <div>Carregando simulação...</div>;

    const improvement = simulation.value - (valuation.valuation_result?.value || 0);
    const improvementPercent = ((improvement / (valuation.valuation_result?.value || 1)) * 100).toFixed(1);

    const isStartup = valuation.valuation_result?.method?.includes('Startup');

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    ⚡ Simulador de Potencial
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* CONTROLS */}
                    <div className="md:col-span-1 space-y-8 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg">

                        {/* 1. Growth Slider */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Aceleração de Crescimento (+{params.growthRate}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={params.growthRate}
                                onChange={(e) => setParam('growthRate', Number(e.target.value))}
                                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer dark:bg-blue-900"
                            />
                            <p className="text-xs text-gray-500 mt-1">Impacta Receita Futura e Score de Crescimento.</p>
                        </div>

                        {/* 2. Margin Slider (Only for established, but keeps simple UI) */}
                        {!isStartup && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Otimização de Margem (+{params.marginImprovement}%)
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="20"
                                    step="1"
                                    value={params.marginImprovement}
                                    onChange={(e) => setParam('marginImprovement', Number(e.target.value))}
                                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer dark:bg-green-900"
                                />
                                <p className="text-xs text-gray-500 mt-1">Impacta diretamente o EBITDA.</p>
                            </div>
                        )}

                        {/* 3. Governance/Risk Slider */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Profissionalização & Riscos ({params.riskReduction}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="10"
                                value={params.riskReduction}
                                onChange={(e) => setParam('riskReduction', Number(e.target.value))}
                                className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer dark:bg-purple-900"
                            />
                            <p className="text-xs text-gray-500 mt-1">Simula implementação de processos, auditoria e redução de dependência do dono.</p>
                        </div>

                    </div>

                    {/* RESULTS VISUALIZATION */}
                    <div className="md:col-span-2 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-4 text-center">

                            {/* CURRENT */}
                            <div className="p-4 rounded-lg border border-gray-100 dark:border-zinc-800 opacity-70">
                                <div className="text-sm text-gray-500 uppercase tracking-wide">Valuation Atual</div>
                                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300 my-2">
                                    <NumericFormat value={valuation.valuation_result?.value} displayType="text" thousandSeparator="," prefix="$" />
                                </div>
                                <div className="text-xs text-gray-400">
                                    Múltiplo: {baseline.multiple}x
                                </div>
                            </div>

                            {/* SIMULATED */}
                            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 relative overflow-hidden transition-all duration-300">
                                <div className="text-sm text-blue-600 dark:text-blue-300 uppercase tracking-wide font-bold">Valuation Potencial</div>
                                <div className="text-3xl font-extrabold text-blue-700 dark:text-blue-200 my-2 scale-110 transform transition-transform">
                                    <NumericFormat value={simulation.value} displayType="text" thousandSeparator="," prefix="$" />
                                </div>
                                <div className="text-xs text-blue-500 dark:text-blue-400 font-medium">
                                    Novo Múltiplo: {simulation.multiple}x
                                </div>

                                {/* Badge */}
                                {improvement > 0 && (
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                                        +{improvementPercent}%
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* DELTAS EXPLAINED */}
                        <div className="mt-8 grid grid-cols-3 gap-2 text-center text-sm">
                            <div className="flex flex-col items-center">
                                <span className="text-gray-500">Novo {isStartup ? 'Receita' : 'EBITDA'}</span>
                                <span className="font-semibold text-gray-800 dark:text-white">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', compactDisplay: 'short' }).format(simulation.driver)}
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-gray-500">Qualidade (Score)</span>
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-gray-600 line-through text-xs">{valuation.valuation_result?.details?.score}</span>
                                    <span className="font-bold text-green-600">→ {simulation.score.totalScore.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-gray-500">Valor Criado</span>
                                <span className="font-bold text-green-600">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', compactDisplay: 'short' }).format(improvement)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp, Target, DollarSign, Clock, CheckCircle2, Circle } from 'lucide-react';
import { NumericFormat } from 'react-number-format';

export interface ImprovementAction {
    id: string;
    title: string;
    description: string;
    category: 'operations' | 'revenue' | 'risk' | 'growth' | 'moat';
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    estimatedROI: number; // Percentage increase in valuation
    timeframe: string; // e.g., "3-6 months"
    priority: number; // 1-5
    completed?: boolean;
}

interface Props {
    actions: ImprovementAction[];
    currentValuation: number;
    currency: string;
}

export function ImprovementPlanCard({ actions, currentValuation, currency }: Props) {
    const t = useTranslations('Dashboard.improvements');
    const currencyPrefix = currency === 'BRL' ? 'R$ ' : '$ ';

    const sortedActions = [...actions].sort((a, b) => b.priority - a.priority);
    const totalPotentialIncrease = actions.reduce((sum, action) => sum + action.estimatedROI, 0);
    const projectedValuation = currentValuation * (1 + totalPotentialIncrease / 100);

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'high': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'low': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'operations': return '⚙️';
            case 'revenue': return '💰';
            case 'risk': return '🛡️';
            case 'growth': return '📈';
            case 'moat': return '🏰';
            default: return '📌';
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                    Plano de Melhoria
                </h3>
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">
                    {actions.length} Ações
                </span>
            </div>

            {/* Potential Value Increase Summary */}
            <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
                <div className="flex items-start justify-between mb-2">
                    <div>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                            Aumento Potencial de Valor
                        </p>
                        <h4 className="text-3xl font-black text-emerald-900 dark:text-emerald-300 mt-1">
                            +{totalPotentialIncrease.toFixed(1)}%
                        </h4>
                    </div>
                    <Target className="w-8 h-8 text-emerald-500" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-600 dark:text-gray-300">
                        De{' '}
                        <NumericFormat
                            value={currentValuation}
                            displayType="text"
                            thousandSeparator=","
                            prefix={currencyPrefix}
                            className="font-semibold"
                        />
                        {' '}para{' '}
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                            <NumericFormat
                                value={projectedValuation}
                                displayType="text"
                                thousandSeparator=","
                                prefix={currencyPrefix}
                            />
                        </span>
                    </span>
                </div>
            </div>

            {/* Action Items */}
            <div className="space-y-3">
                {sortedActions.slice(0, 5).map((action) => (
                    <div
                        key={action.id}
                        className="p-4 border border-gray-200 dark:border-zinc-800 rounded-xl hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-1">
                                {action.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <Circle className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{getCategoryIcon(action.category)}</span>
                                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                            {action.title}
                                        </h4>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${getImpactColor(action.impact)}`}>
                                        +{action.estimatedROI.toFixed(1)}%
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {action.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>{action.timeframe}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold">Esforço:</span>
                                        <span className="capitalize">{action.effort}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold">Prioridade:</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                            {action.priority}/5
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {actions.length > 5 && (
                <div className="mt-4 text-center">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                        Ver todas as {actions.length} ações →
                    </button>
                </div>
            )}

            {/* CTA Footer */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                    💡 <span className="font-semibold">Dica:</span> Comece pelas ações de alta prioridade. 
                    Implementar estas melhorias pode aumentar significativamente o valor da sua empresa.
                </p>
            </div>
        </div>
    );
}

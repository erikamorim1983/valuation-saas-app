'use client';

import { useTranslations } from 'next-intl';
import { BarChart3, Users, Zap, Info } from 'lucide-react';
import { NumericFormat } from 'react-number-format';

interface BenchmarkData {
    sector: string;
    marketAvg: number;
    userValue: number;
    networkAvg: number;
    similarCount: number;
}

interface Props {
    data: BenchmarkData;
}

export function BenchmarkingCard({ data }: Props) {
    const t = useTranslations('Dashboard.benchmarks');

    const diff = ((data.userValue - data.marketAvg) / data.marketAvg) * 100;

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Comparativo de Mercado (Benchmark)
                </h3>
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full">
                    Beta
                </span>
            </div>

            <div className="space-y-6">
                {/* A. Market Multiple (Financial API) */}
                <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Múltiplo do Setor ({data.sector})</p>
                            <h4 className="text-2xl font-black text-gray-900 dark:text-white">{data.marketAvg}x</h4>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs font-bold ${diff >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% vs Mercado
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(100, (data.userValue / data.marketAvg) * 50)}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                        <Info className="w-3 h-3" /> Fonte: Financial Data Feed API
                    </p>
                </div>

                {/* D. Network Effect (Our DB) */}
                <div className="flex items-center gap-4 p-4 border border-gray-100 dark:border-zinc-800 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Média BrixAurea ({data.sector})</p>
                        <p className="font-bold text-gray-900 dark:text-white">{data.networkAvg}x <span className="text-[10px] font-normal text-gray-400 ml-1">({data.similarCount} empresas)</span></p>
                    </div>
                </div>

                {/* C. AI Similarity (AI Recommendation) */}
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-indigo-500 fill-indigo-500" />
                        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">Inteligência de Similaridade</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Encontramos <span className="font-bold text-indigo-600 dark:text-indigo-400">3 modelos</span> de negócios similares que foram adquiridos por múltiplos de <span className="font-bold">7.2x - 8x ARR</span>.
                    </p>
                </div>
            </div>
        </div>
    );
}

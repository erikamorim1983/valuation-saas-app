'use client';

import { useTranslations } from 'next-intl';
import { NumericFormat } from 'react-number-format';
import { ValuationResult } from '@/lib/valuation';

interface ReportViewProps {
    companyName: string;
    sector: string;
    currency: string;
    result: ValuationResult;
    date: string;
}

export function ReportView({ companyName, sector, currency, result, date }: ReportViewProps) {
    const t = useTranslations('Report');
    const details = result.details as any;
    const pillars = details.pillarScores || {};
    const currencyPrefix = currency === 'BRL' ? 'R$ ' : '$ ';

    return (
        <div id="valuation-report-template" className="bg-white p-12 w-[800px] border border-gray-100 shadow-2xl mx-auto font-sans text-gray-900">
            {/* Header / Branding */}
            <div className="flex justify-between items-center border-b-2 border-blue-600 pb-8 mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">{t('title')}</h1>
                    <p className="text-lg text-gray-500 font-medium">{t('subtitle')}</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-gray-900 italic">BrixAurea<span className="text-blue-600">Valuation</span></div>
                    <p className="text-sm text-gray-500">{t('generatedOn')} {new Date(date).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Company Info Section */}
            <div className="grid grid-cols-2 gap-10 mb-12">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                    <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">{t('companyInfo')}</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Empresa</p>
                            <p className="text-xl font-bold text-gray-800">{companyName}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase">Setor</p>
                            <p className="text-lg font-medium text-gray-700">{sector}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-900 p-6 rounded-2xl shadow-indigo-200 shadow-lg text-white">
                    <h2 className="text-sm font-bold text-blue-300 uppercase tracking-widest mb-4">{t('valuationSummary')}</h2>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-blue-300 font-bold uppercase">{t('estimatedEquity')}</p>
                            <p className="text-4xl font-black tracking-tighter">
                                <NumericFormat value={result.value} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                            </p>
                        </div>
                        <div className="flex gap-6 pt-2 border-t border-blue-800">
                            <div>
                                <p className="text-[10px] text-blue-400 font-bold uppercase">Multiple</p>
                                <p className="text-lg font-bold">{details.chosenMultiple}x</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-blue-400 font-bold uppercase">Quality Score</p>
                                <p className="text-lg font-bold">{Math.round(details.score * 100)}/100</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Range and Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                {/* Range Card */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                        {t('marketRange')}
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-end pb-2 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-400 uppercase">Min</p>
                            <p className="text-xl font-bold text-gray-600">
                                <NumericFormat value={result.range?.min || 0} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                            </p>
                        </div>
                        <div className="flex justify-between items-end pb-2 border-b-2 border-blue-100 bg-blue-50/50 p-2 rounded-lg">
                            <p className="text-sm font-bold text-blue-600 uppercase">Base</p>
                            <p className="text-2xl font-black text-blue-900">
                                <NumericFormat value={result.value} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                            </p>
                        </div>
                        <div className="flex justify-between items-end pb-2 border-b border-gray-100">
                            <p className="text-sm font-bold text-gray-400 uppercase">Max</p>
                            <p className="text-xl font-bold text-gray-600">
                                <NumericFormat value={result.range?.max || 0} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Qualitative Pillars */}
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                        {t('qualityHealth')}
                    </h2>
                    <div className="space-y-4">
                        <ReportScoreBar label={t('pillarOps')} value={pillars.ops} color="bg-blue-600" />
                        <ReportScoreBar label={t('pillarRec')} value={pillars.rec} color="bg-indigo-600" />
                        <ReportScoreBar label={t('pillarConc')} value={pillars.conc} color="bg-green-600" />
                        <ReportScoreBar label={t('pillarGrow')} value={pillars.grow} color="bg-orange-600" />
                        <ReportScoreBar label={t('pillarRisk')} value={pillars.risk} color="bg-red-600" />
                    </div>
                </div>
            </div>

            {/* Methodology & Notes */}
            <div className="mt-12 pt-12 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{t('methodology')}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {t('finalNotes')}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-3">{t('disclaimerTitle')}</h3>
                        <p className="text-[11px] text-gray-500 leading-snug">
                            {t('disclaimerText')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / ID */}
            <div className="mt-20 text-center">
                <p className="text-[10px] text-gray-300 font-mono tracking-widest uppercase">Report ID: {result.details?.valuationId || 'AUTO-GEN-VAL-001'}</p>
            </div>
        </div>
    );
}

function ReportScoreBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-500 uppercase tracking-tight">{label}</span>
                <span className="text-gray-900">{Math.round(value)}/100</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                    className={`${color} h-1.5 rounded-full`}
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                ></div>
            </div>
        </div>
    );
}

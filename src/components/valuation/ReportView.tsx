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

    // Force hex colors for html2canvas compatibility with Tailwind 4
    const colors = {
        white: '#ffffff',
        blue900: '#1e3a8a',
        blue600: '#2563eb',
        blue300: '#93c5fd',
        blue50: '#eff6ff',
        gray50: '#f9fafb',
        gray100: '#f3f4f6',
        gray200: '#e5e7eb',
        gray300: '#d1d5db',
        gray400: '#9ca3af',
        gray500: '#6b7280',
        gray600: '#4b5563',
        gray700: '#374151',
        gray800: '#1f2937',
        gray900: '#111827',
        green500: '#22c55e',
        green600: '#16a34a',
        indigo600: '#4f46e5',
        orange600: '#ea580c',
        red600: '#dc2626'
    };

    return (
        <div id="valuation-report-template" style={{ backgroundColor: colors.white, padding: '48px', width: '800px', border: `1px solid ${colors.gray100}`, margin: '0 auto', fontFamily: 'sans-serif', color: colors.gray900 }}>
            {/* Header / Branding */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${colors.blue600}`, paddingBottom: '32px', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 800, color: colors.blue900, letterSpacing: '-0.025em' }}>{t('title')}</h1>
                    <p style={{ fontSize: '18px', color: colors.gray500, fontWeight: 500 }}>{t('subtitle')}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 900, color: colors.gray900, fontStyle: 'italic' }}>BrixAurea<span style={{ color: colors.blue600 }}>Valuation</span></div>
                    <p style={{ fontSize: '14px', color: colors.gray500 }}>{t('generatedOn')} {new Date(date).toLocaleDateString()}</p>
                </div>
            </div>

            {/* Company Info Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '48px' }}>
                <div style={{ backgroundColor: colors.gray50, padding: '24px', borderRadius: '16px', border: `1px solid ${colors.gray100}` }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 700, color: colors.blue600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>{t('companyInfo')}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: colors.gray400, fontWeight: 700, textTransform: 'uppercase' }}>Empresa</p>
                            <p style={{ fontSize: '20px', fontWeight: 700, color: colors.gray800 }}>{companyName}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '12px', color: colors.gray400, fontWeight: 700, textTransform: 'uppercase' }}>Setor</p>
                            <p style={{ fontSize: '18px', fontWeight: 500, color: colors.gray700 }}>{sector}</p>
                        </div>
                    </div>
                </div>
                <div style={{ backgroundColor: colors.blue900, padding: '24px', borderRadius: '16px', color: colors.white }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 700, color: colors.blue300, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>{t('valuationSummary')}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <p style={{ fontSize: '12px', color: colors.blue300, fontWeight: 700, textTransform: 'uppercase' }}>{t('estimatedEquity')}</p>
                            <p style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-0.05em' }}>
                                <NumericFormat value={result.value} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '24px', paddingTop: '8px', borderTop: `1px solid #1e40af` }}>
                            <div>
                                <p style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>Multiple</p>
                                <p style={{ fontSize: '18px', fontWeight: 700 }}>{details.chosenMultiple}x</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>Quality Score</p>
                                <p style={{ fontSize: '18px', fontWeight: 700 }}>{Math.round(details.score * 100)}/100</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Range and Pillars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '48px' }}>
                {/* Range Card */}
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: colors.gray800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '6px', height: '24px', backgroundColor: colors.blue600, borderRadius: '9999px' }}></span>
                        {t('marketRange')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '8px', borderBottom: `1px solid ${colors.gray100}` }}>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: colors.gray400, textTransform: 'uppercase' }}>Min</p>
                            <p style={{ fontSize: '20px', fontWeight: 700, color: colors.gray600 }}>
                                <NumericFormat value={result.range?.min || 0} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                            </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '8px', borderBottom: `2px solid ${colors.blue50}`, backgroundColor: colors.blue50, padding: '8px', borderRadius: '8px' }}>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: colors.blue600, textTransform: 'uppercase' }}>Base</p>
                            <p style={{ fontSize: '24px', fontWeight: 900, color: colors.blue900 }}>
                                <NumericFormat value={result.value} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                            </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '8px', borderBottom: `1px solid ${colors.gray100}` }}>
                            <p style={{ fontSize: '14px', fontWeight: 700, color: colors.gray400, textTransform: 'uppercase' }}>Max</p>
                            <p style={{ fontSize: '20px', fontWeight: 700, color: colors.gray600 }}>
                                <NumericFormat value={result.range?.max || 0} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                            </p>
                        </div>
                    </div>
                </div>

                {/* Qualitative Pillars */}
                <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: colors.gray800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '6px', height: '24px', backgroundColor: colors.green500, borderRadius: '9999px' }}></span>
                        {t('qualityHealth')}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <ReportScoreBar label={t('pillarOps')} value={pillars.ops} color={colors.blue600} />
                        <ReportScoreBar label={t('pillarRec')} value={pillars.rec} color={colors.indigo600} />
                        <ReportScoreBar label={t('pillarConc')} value={pillars.conc} color={colors.green600} />
                        <ReportScoreBar label={t('pillarGrow')} value={pillars.grow} color={colors.orange600} />
                        <ReportScoreBar label={t('pillarRisk')} value={pillars.risk} color={colors.red600} />
                    </div>
                </div>
            </div>

            {/* Methodology & Notes */}
            <div style={{ marginTop: '48px', paddingTop: '48px', borderTop: `1px solid ${colors.gray200}` }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
                    <div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: colors.gray400, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{t('methodology')}</h3>
                        <p style={{ fontSize: '14px', color: colors.gray600, lineHeight: 1.6 }}>
                            {t('finalNotes')}
                        </p>
                    </div>
                    <div style={{ backgroundColor: colors.gray50, padding: '24px', borderRadius: '12px', border: `1px solid ${colors.gray100}` }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: colors.red600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{t('disclaimerTitle')}</h3>
                        <p style={{ fontSize: '11px', color: colors.gray500, lineHeight: 1.5 }}>
                            {t('disclaimerText')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer / ID */}
            <div style={{ marginTop: '80px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: colors.gray300, fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Report ID: {result.details?.valuationId || 'AUTO-GEN-VAL-001'}</p>
            </div>
        </div>
    );
}

function ReportScoreBar({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                <span style={{ color: '#6b7280', textTransform: 'uppercase', letterSpacing: '-0.025em' }}>{label}</span>
                <span style={{ color: '#111827' }}>{Math.round(value)}/100</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#f3f4f6', borderRadius: '9999px', height: '6px' }}>
                <div
                    style={{ backgroundColor: color, height: '6px', borderRadius: '9999px', width: `${Math.min(100, Math.max(0, value))}%` }}
                ></div>
            </div>
        </div>
    );
}

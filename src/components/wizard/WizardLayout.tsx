'use client';

import { useWizard, WizardStep } from './WizardContext';
import { useTranslations } from 'next-intl';

const steps: WizardStep[] = ['identification', 'financials', 'revenueQuality', 'qualitative', 'moat', 'review'];

export function WizardLayout({ children }: { children: React.ReactNode }) {
    const { step } = useWizard();
    const t = useTranslations('Wizard');

    const currentStepIndex = steps.indexOf(step);
    const progress = ((currentStepIndex + 1) / steps.length) * 100;

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {t(`steps.${step}`)}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                        {currentStepIndex + 1} / {steps.length}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-2xl p-6 sm:p-10 border border-gray-100 dark:border-zinc-800">
                {children}
            </div>
        </div>
    );
}

import { useTranslations } from 'next-intl';

export default function TermsPage() {
    const t = useTranslations('LegalPages.Terms');

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-black">
            <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8 w-full">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {t('title')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-12">
                    {t('lastUpdated')}
                </p>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                        {t('intro')}
                    </p>

                    <div className="space-y-12">
                        {[0, 1, 2, 3].map((index) => (
                            <section key={index}>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                    {t(`sections.${index}.title`)}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {t(`sections.${index}.content`)}
                                </p>
                            </section>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

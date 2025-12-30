'use client';

import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
    const t = useTranslations('ContactPage');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // Simulate API call
        setTimeout(() => {
            setStatus('success');
            // Reset after 3 seconds
            setTimeout(() => setStatus('idle'), 5000);
        }, 1500);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-black">
            {/* Header */}
            <section className="py-20 bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div className="flex gap-6 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('info.email')}</h3>
                                <p className="text-gray-500 dark:text-gray-400">support@brixaurea.com</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('info.phone')}</h3>
                                <p className="text-gray-500 dark:text-gray-400">+1 (555) 000-0000</p>
                            </div>
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('info.office')}</h3>
                                <p className="text-gray-500 dark:text-gray-400">New York, NY - USA</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-zinc-800">
                            {status === 'success' ? (
                                <div className="text-center py-12 space-y-4">
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Send className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('form.success')}</h2>
                                    <p className="text-gray-500">{t('subtitle')}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('form.name')}</label>
                                            <input required type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-700 focus:ring-0 transition-all outline-none" placeholder="Jane Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('form.email')}</label>
                                            <input required type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-700 focus:ring-0 transition-all outline-none" placeholder="jane@example.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('form.subject')}</label>
                                        <input required type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-700 focus:ring-0 transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{t('form.message')}</label>
                                        <textarea required rows={5} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-700 focus:ring-0 transition-all outline-none resize-none"></textarea>
                                    </div>
                                    <Button disabled={status === 'sending'} type="submit" size="lg" className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/20">
                                        {status === 'sending' ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('form.sending')}</> : t('form.send')}
                                    </Button>
                                    {status === 'error' && <p className="text-red-500 text-center font-medium">{t('form.error')}</p>}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

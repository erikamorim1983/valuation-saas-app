import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { Logo } from '@/components/ui/Logo';

export default function Home() {
  const tHero = useTranslations('Hero');
  const tFeatures = useTranslations('Features');
  const tCTA = useTranslations('CTA');

  return (
    <div className="flex flex-col flex-grow">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gray-900 overflow-hidden min-h-[600px] flex items-center">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-40">
          {/* Replace with your image path. Ensuring it exists in public folder */}
          <img
            src="/valuation_hero_bg.png"
            alt="Valuation Background"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-gray-900 z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center w-full">
          <div className="mx-auto max-w-4xl">
            {/* Logo Hero */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 backdrop-blur-md px-8 py-6 rounded-2xl border border-white/20 shadow-2xl">
                <Logo size="xl" variant="hero" animate={false} className="drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] brightness-110" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-8 drop-shadow-2xl">
              {tHero('title')}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-light">
              {tHero('subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {/* Dev Access Button - Bypass Login */}
              <Link href="/valuation/new">
                <Button size="lg" className="px-8 py-6 text-lg w-full sm:w-auto shadow-xl shadow-blue-500/30 bg-blue-600 hover:bg-blue-500 text-white border-none transform hover:scale-105 transition-all">
                  {tHero('ctaStart')}
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Methodology Grid */}
      <section id="methodology" className="py-24 bg-gray-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              {tFeatures('sectionTitle')}
            </h2>
            <p className="max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
              {tFeatures('subTitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{tFeatures('dcfTitle')}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{tFeatures('dcfDesc')}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{tFeatures('multiplesTitle')}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{tFeatures('multiplesDesc')}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{tFeatures('earningsTitle')}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{tFeatures('earningsDesc')}</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-black p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{tFeatures('qualitativeTitle')}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{tFeatures('qualitativeDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-black border-t border-gray-100 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl mb-6">
            {tCTA('title')}
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            {tCTA('subtitle')}
          </p>
          <Link href="/valuation/new">
            <Button size="lg" className="px-12 py-6 text-lg shadow-lg hover:shadow-blue-500/25 transition-all">
              {tCTA('button')}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

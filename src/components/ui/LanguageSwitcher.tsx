'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();
    const locale = useLocale();
    const [isPending, startTransition] = useTransition();

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            // Replace the locale in the pathname
            // Assuming pathname starts with /en, /pt, or /es
            // We need to be careful if the locale is hidden or not. 
            // But typically with next-intl [locale] routing, it's always there.

            const segments = pathname.split('/');
            segments[1] = nextLocale;
            const newPath = segments.join('/');

            router.replace(newPath);
        });
    };

    return (
        <div className="relative">
            <select
                defaultValue={locale}
                onChange={onSelectChange}
                disabled={isPending}
                className="appearance-none bg-transparent py-1 pl-2 pr-6 text-sm font-medium text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md cursor-pointer"
            >
                <option value="en">🇺🇸 EN</option>
                <option value="pt">🇧🇷 PT</option>
                <option value="es">🇪🇸 ES</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700 dark:text-gray-300">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
            </div>
        </div>
    );
}

import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
    locales: ['en', 'pt', 'es'],
    defaultLocale: 'en'
});

export default async function middleware(request: NextRequest) {
    // 1. Run i18n middleware first to handle routing/redirects
    // This helps next-intl resolve the locale first
    const response = intlMiddleware(request);

    // 2. Run Supabase middleware to refresh session and carry over cookies
    // We pass the i18n response so Supabase can attach cookies/headers to it
    return await updateSession(request, response);
}

export const config = {
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    matcher: ['/((?!api|_next|_vercel|auth|.*\\..*).*)']
};

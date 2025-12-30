import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, nextResponse?: NextResponse) {
    let response = nextResponse || NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Fail safe: If no env vars, skip Supabase logic to avoid crashing logic validation
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase credentials missing. Skipping authentication middleware.')
        return response
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })

                    response = NextResponse.next({
                        request,
                    })

                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // This will refresh session if expired - required for Server Components
    const { data: { user } } = await supabase.auth.getUser()

    // Profile flow enforcement for authenticated users
    if (user) {
        const { pathname } = request.nextUrl

        // Extract locale from pathname (e.g., /en/dashboard -> en)
        const localeMatch = pathname.match(/^\/(en|pt|es)/)
        const locale = localeMatch ? localeMatch[1] : 'en'

        // Skip checks for auth callback and public routes
        if (pathname.includes('/auth/') || pathname.includes('/login') || pathname.includes('/_next') || pathname.includes('/api')) {
            return response
        }

        // Check if user has a profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

        // If no profile exists, redirect to profile selection
        if (!profile && !pathname.includes('/profile-selection')) {
            const url = request.nextUrl.clone()
            url.pathname = `/${locale}/profile-selection`
            return NextResponse.redirect(url)
        }

        // If profile exists but onboarding not completed
        if (profile && !profile.onboarding_completed) {
            const onboardingPath = profile.user_type === 'consultant'
                ? `/${locale}/onboarding/consultant`
                : `/${locale}/onboarding/business-owner`

            if (!pathname.includes('/onboarding/')) {
                const url = request.nextUrl.clone()
                url.pathname = onboardingPath
                return NextResponse.redirect(url)
            }
        }
    }

    return response
}

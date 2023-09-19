import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    async function middleware(req) {
        const pathname = req.nextUrl.pathname

        // Manage route protection
        const isAuth = await getToken( { req })
        const isLoginPage = pathname.startsWith('/login')

        const sensitiveRoutes = ['/dashboard']
        const isAccessingSensitiveRoute = sensitiveRoutes.some((route) => pathname.startsWith(route))

        // logged in users should not be able to access the login page
        if (isLoginPage) {
            if (isAuth) {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }

            return NextResponse.next()
        }

        // senstive routes can not be accessed by logged-out/non users
        if (!isAuth && isAccessingSensitiveRoute) {
            return NextResponse.redirect(new URL('/login', req.url))
        }

        if (pathname === '/') {
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }


    }, {
        callbacks: {
            // make sure middlware is always called to avoid infinite redirects
            async authorized() {
                return true
            },
        },
    }
)

export const config = {
    matcher: ['/', '/login', '/dashboard/:path*']
}
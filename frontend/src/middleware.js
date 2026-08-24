import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null;
    }
}

function parseUserRole(roleClaim) {
    if (roleClaim === 2 || roleClaim === '2' || roleClaim === 'Admin') return 2;
    if (roleClaim === 1 || roleClaim === '1' || roleClaim === 'Manager') return 1;
    return 0;
}

function clearAuthCookies(response) {
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
}

async function tryRefresh(request) {
    try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
                cookie: request.headers.get('cookie') ?? '',
            },
        });

        if (res.status === 401 || res.status === 403) {
            return { status: 'invalid' };
        }

        if (!res.ok) {
            return { status: 'error' };
        }

        // getSetCookie() keeps each Set-Cookie header separate; .get() would merge them into one broken string
        const setCookies =
            typeof res.headers.getSetCookie === 'function'
                ? res.headers.getSetCookie()
                : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);

        return { status: 'ok', setCookies };
    } catch {
        return { status: 'error' };
    }
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const isLoginPath = pathname === '/admin/login';

    if (!token && !refreshToken) {
        if (isLoginPath) return NextResponse.next();
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    let payload = token ? await verifyToken(token) : null;
    let isAccessTokenValid = payload !== null;

    if (!isAccessTokenValid && refreshToken) {
        const refreshResult = await tryRefresh(request);

        if (refreshResult.status === 'ok') {
            const newTokenCookie = refreshResult.setCookies.find((c) => c.startsWith('accessToken='));
            const newAccessTokenMatch = newTokenCookie ? newTokenCookie.match(/accessToken=([^;]+)/) : null;
            const newToken = newAccessTokenMatch ? newAccessTokenMatch[1] : null;
            payload = newToken ? await verifyToken(newToken) : null;
            isAccessTokenValid = payload !== null;
            request._pendingSetCookies = refreshResult.setCookies;
        } else if (refreshResult.status === 'invalid') {
            if (isLoginPath) return NextResponse.next();
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            return clearAuthCookies(response);
        } else {
            if (isLoginPath) return NextResponse.next();
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            return clearAuthCookies(response);
        }
    }

    if (isLoginPath) {
        if (isAccessTokenValid) {
            const response = NextResponse.redirect(new URL('/admin', request.url));
            if (request._pendingSetCookies) {
                for (const cookie of request._pendingSetCookies) {
                    response.headers.append('set-cookie', cookie);
                }
            }
            return response;
        }
        return NextResponse.next();
    }

    if (!isAccessTokenValid) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        return clearAuthCookies(response);
    }

    const roleClaim =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        payload.role ??
        payload.Role;
    const userRole = parseUserRole(roleClaim);

    let finalResponse;

    if (userRole === 0) {
        finalResponse = NextResponse.redirect(new URL('/admin/login', request.url));
    } else if (userRole === 1 && pathname.startsWith('/admin/managers')) {
        finalResponse = NextResponse.redirect(new URL('/admin', request.url));
    } else {
        finalResponse = NextResponse.next();
    }

    // append (not set) so each cookie stays a separate Set-Cookie header
    if (request._pendingSetCookies) {
        for (const cookie of request._pendingSetCookies) {
            finalResponse.headers.append('set-cookie', cookie);
        }
    }

    return finalResponse;
}

export const config = {
    matcher: ['/admin/:path*'],
};
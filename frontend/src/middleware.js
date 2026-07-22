import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyToken(token) {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch {
        return null; // imza geçersiz VEYA süresi dolmuş (jose exp'i kendi kontrol eder)
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

        const setCookieHeader = res.headers.get('set-cookie');
        return { status: 'ok', setCookieHeader };
    } catch {
        return { status: 'error' };
    }
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const isLoginPath = pathname === '/admin/login';

    // 1. Hiçbir token yoksa
    if (!token && !refreshToken) {
        if (isLoginPath) return NextResponse.next();
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    let payload = token ? await verifyToken(token) : null;
    let isAccessTokenValid = payload !== null;

    // 2. Access token geçersiz/expired ama refresh token varsa: BURADA gerçekten refresh dene
    if (!isAccessTokenValid && refreshToken) {
        const refreshResult = await tryRefresh(request);

        if (refreshResult.status === 'ok') {
            const newAccessTokenMatch = refreshResult.setCookieHeader?.match(/accessToken=([^;]+)/);
            const newToken = newAccessTokenMatch ? newAccessTokenMatch[1] : null;
            payload = newToken ? await verifyToken(newToken) : null;
            isAccessTokenValid = payload !== null;
            request._pendingSetCookie = refreshResult.setCookieHeader;
        } else if (refreshResult.status === 'invalid') {
            if (isLoginPath) return NextResponse.next();
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            return clearAuthCookies(response);
        } else {
            if (isLoginPath) return NextResponse.next();
            return NextResponse.next();
        }
    }

    // 3. Login sayfasındaysa
    if (isLoginPath) {
        if (isAccessTokenValid) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
        return NextResponse.next();
    }

    // 4. Hâlâ geçerli token yoksa (refresh de yapıldıysa ve olmadıysa buraya düşmemesi lazım,
    // ama savunma amaçlı bırakıyoruz)
    if (!isAccessTokenValid) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        return clearAuthCookies(response);
    }

    // RBAC
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

    // Refresh sırasında backend'den gelen yeni cookie'leri response'a taşı
    if (request._pendingSetCookie) {
        finalResponse.headers.set('set-cookie', request._pendingSetCookie);
    }

    return finalResponse;
}

export const config = {
    matcher: ['/admin/:path*'],
};
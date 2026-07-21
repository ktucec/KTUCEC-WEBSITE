import { NextResponse } from 'next/server';

function decodeJwtPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

function parseUserRole(roleClaim) {
    if (roleClaim === 2 || roleClaim === '2' || roleClaim === 'Admin') return 2;
    if (roleClaim === 1 || roleClaim === '1' || roleClaim === 'Manager') return 1;
    return 0; // Default to Member (0)
}

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Hem access hem de refresh token'ları alıyoruz
    const token = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    const isLoginPath = pathname === '/admin/login';

    // 1. KONTROL: Her iki token da yoksa oturum tamamen kapalı demektir.
    if (!token && !refreshToken) {
        if (isLoginPath) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = token ? decodeJwtPayload(token) : null;

    // 2. KONTROL: Token parse edilemediyse ve Refresh token de yoksa
    if (!payload && !refreshToken) {
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('accessToken');
        return response;
    }

    // 3. KONTROL: Access Token'ın süresi DOLMUŞSA
    if (payload && payload.exp && payload.exp * 1000 < Date.now()) {
        if (!refreshToken) {
            // Sadece Access Token dolmuş ve Refresh Token yoksa çıkışa zorla
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('accessToken');
            return response;
        }
        // EĞER REFRESH TOKEN VARSA BURADA HİÇBİR ŞEY YAPMIYORUZ.
        // Kullanıcının geçişine izin veriyoruz. Çünkü sayfa yüklendiğinde 
        // api.js backend'e istek atacak, 401 alacak ve sessizce refresh yapacak.
    }

    // RBAC (Rol Kontrolü) için süresi dolmuş bile olsa mevcut token'dan rolü okuyoruz
    let userRole = 0;
    if (payload) {
        const roleClaim =
            payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
            payload.role ??
            payload.Role;
        userRole = parseUserRole(roleClaim);
    }

    // Role 0 (Member) restrictions
    if (userRole === 0) {
        if (isLoginPath) {
            return NextResponse.next();
        }
        return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Redirect authenticated users away from login page
    if (isLoginPath) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Manager (1) access restriction for managers route
    if (userRole === 1 && pathname.startsWith('/admin/managers')) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Tüm engelleri aştıysa geçişe izin ver
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
    ],
};
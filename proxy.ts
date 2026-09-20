import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const privateRoutes = ['/notes', '/profile'];
const publicRoutes = ['/sign-in', '/sign-up'];

// Parse a single "Set-Cookie" header string into a name, value and options
// object that can be passed to NextResponse.cookies.set().
function parseSetCookie(setCookieString: string) {
  const parts = setCookieString.split(';').map((part) => part.trim());
  const [nameValue, ...attributes] = parts;
  const eqIndex = nameValue.indexOf('=');
  const name = nameValue.slice(0, eqIndex);
  const value = nameValue.slice(eqIndex + 1);

  const options: {
    path?: string;
    maxAge?: number;
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    domain?: string;
  } = {};

  for (const attribute of attributes) {
    const [rawKey, ...rawVal] = attribute.split('=');
    const key = rawKey.toLowerCase();
    const attrValue = rawVal.join('=');

    switch (key) {
      case 'path':
        options.path = attrValue;
        break;
      case 'max-age':
        options.maxAge = Number(attrValue);
        break;
      case 'expires':
        options.expires = new Date(attrValue);
        break;
      case 'domain':
        options.domain = attrValue;
        break;
      case 'httponly':
        options.httpOnly = true;
        break;
      case 'secure':
        options.secure = true;
        break;
      case 'samesite':
        options.sameSite = attrValue.toLowerCase() as
          | 'lax'
          | 'strict'
          | 'none';
        break;
      default:
        break;
    }
  }

  return { name, value, options };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  let isAuthenticated = !!accessToken;

  // Collected "Set-Cookie" strings returned by a successful session renewal.
  let refreshedCookies: string[] = [];

  if (!accessToken && refreshToken) {
    try {
      const { checkSession } = await import('./lib/api/serverApi');
      const cookieHeader = `refreshToken=${refreshToken}`;
      const sessionResponse = await checkSession(cookieHeader);

      if (sessionResponse.data?.success) {
        isAuthenticated = true;

        // Extract the refreshed tokens from the "set-cookie" header so they can
        // be forwarded to the browser on the outgoing response.
        const setCookie = sessionResponse.headers['set-cookie'];
        if (Array.isArray(setCookie)) {
          refreshedCookies = setCookie;
        } else if (typeof setCookie === 'string') {
          refreshedCookies = [setCookie];
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Helper that applies the refreshed cookies (if any) onto a response so the
  // browser receives the updated tokens.
  const applyRefreshedCookies = (response: NextResponse) => {
    for (const cookieString of refreshedCookies) {
      const { name, value, options } = parseSetCookie(cookieString);
      if (name) {
        response.cookies.set(name, value, options);
      }
    }
    return response;
  };

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return applyRefreshedCookies(
      NextResponse.redirect(new URL('/', request.url))
    );
  }

  return applyRefreshedCookies(NextResponse.next());
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up'],
};

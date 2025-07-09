import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt'; // Exemplo se usar NextAuth.js, ajuste conforme sua auth

// Rotas que NÃO precisam de autenticação e devem ser acessíveis publicamente
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password', // Se você tiver uma rota de recuperação de senha
  '/api/auth/login',    // <--- ESSENCIAL: Permite que a API de login seja acessada sem autenticação prévia
  '/api/auth/register', // <--- ESSENCIAL: Permite que a API de registro seja acessada sem autenticação prévia
  '/api/admin/register-root', // Se você permitir acesso público (com super senha) para o primeiro ROOT
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Se a rota for estática do Next.js ou um favicon, ou estiver nas rotas públicas, permite o acesso.
  if (pathname.startsWith('/_next/') || pathname.includes('.') || PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // --- A PARTIR DAQUI, TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO ---

  // Exemplo de verificação de token (adapte ao seu método de autenticação)
  // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); // Se usar NextAuth.js
  // Ou, se você armazena o token em um cookie:
  // const userToken = req.cookies.get('your_auth_token_name')?.value;

  // if (!userToken) { // Se não há token/sessão, redireciona para o login
  //   const url = req.nextUrl.clone();
  //   url.pathname = '/login';
  //   return NextResponse.redirect(url);
  // }

  // Restante da sua lógica de autorização (verificação de role, tenantId, etc.)
  // ...

  return NextResponse.next(); // Permite que a requisição continue
}

// O matcher define quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    // Exclui arquivos estáticos, imagens, e as rotas de API que já estão em PUBLIC_ROUTES
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
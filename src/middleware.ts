import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// import { getToken } from 'next-auth/jwt'; // Exemplo se usar NextAuth.js, ajuste conforme sua auth

// Rotas que NÃO precisam de autenticação e devem ser acessíveis publicamente
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password', // Se você tiver uma rota de recuperação de senha
  '/api/auth/login',    // ESSENCIAL: Permite que a API de login seja acessada sem autenticação prévia
  '/api/auth/register', // ESSENCIAL: Permite que a API de registro seja acessada sem autenticação prévia
  '/api/admin/register-root', // Se você permitir acesso público (com super senha) para o primeiro ROOT
];

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get('host');
  const url = req.nextUrl;
  let currentPathname = url.pathname; // Use uma variável para o pathname que pode ser reescrito

  // --- LÓGICA DE REESCRITA DE SUBDOMÍNIO ---
  // Regex para capturar subdomínios em um IP específico da rede local (ex: oplan-saude.192.168.100.67:3002)
  // O IP "192.168.100.67" é escapado com barras invertidas para ser tratado como literal.
  const subdomainMatch = hostname?.match(/^(.*?)\.192\.168\.100\.67:\d+$/);

  if (subdomainMatch && subdomainMatch[1] && subdomainMatch[1] !== 'www') {
    const subdomain = subdomainMatch[1]; // Ex: "oplan-saude"

    // Se o caminho da URL já começa com o slug do subdomínio, não faça nada
    // Isso evita reescritas redundantes e loops de redirecionamento
    if (!url.pathname.startsWith(`/${subdomain}`) && url.pathname !== '/') { // Adicionado url.pathname !== '/' para reescrever a raiz do subdomínio
      url.pathname = `/${subdomain}${url.pathname}`;
      console.log(`Middleware: Reescrevendo de ${req.url} para ${url.href}`);
      currentPathname = url.pathname; // Atualiza o pathname para a lógica de autenticação
      return NextResponse.rewrite(url); // Retorna a reescrita
    } else if (url.pathname === '/') { // Se for a raiz do subdomínio, reescreve para /subdomain/dashboard
      url.pathname = `/${subdomain}/dashboard`;
      console.log(`Middleware: Reescrevendo raiz do subdomínio de ${req.url} para ${url.href}`);
      currentPathname = url.pathname; // Atualiza o pathname
      return NextResponse.rewrite(url);
    }
  }

  // Se não foi feita uma reescrita de subdomínio, ou se já estava no formato reescrito,
  // a requisição continua para a próxima parte do middleware.
  console.log(`Middleware: Nenhuma reescrita de subdomínio necessária para ${req.url} ou já reescrita.`);


  // --- LÓGICA DE AUTENTICAÇÃO ---
  // Se a rota for estática do Next.js ou um favicon, ou estiver nas rotas públicas, permite o acesso.
  // Usamos 'currentPathname' que já pode ter sido reescrito pelo subdomínio.
  if (currentPathname.startsWith('/_next/') || currentPathname.includes('.') || PUBLIC_ROUTES.includes(currentPathname)) {
    console.log(`Middleware: Rota pública ou estática (${currentPathname}). Permitindo acesso.`);
    return NextResponse.next();
  }

  // --- A PARTIR DAQUI, TODAS AS ROTAS PRECISAM DE AUTENTICAÇÃO ---

  // Exemplo de verificação de token (adapte ao seu método de autenticação)
  // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); // Se usar NextAuth.js
  // Ou, se você armazena o token em um cookie:
  // const userToken = req.cookies.get('your_auth_token_name')?.value;

  // if (!userToken) { // Se não há token/sessão, redireciona para o login
  //   console.log(`Middleware: Usuário não autenticado para rota protegida (${currentPathname}). Redirecionando para /login.`);
  //   const loginUrl = req.nextUrl.clone();
  //   loginUrl.pathname = '/login';
  //   return NextResponse.redirect(loginUrl);
  // }

  // Restante da sua lógica de autorização (verificação de role, tenantId, etc.)
  // ...

  console.log(`Middleware: Rota protegida (${currentPathname}). Continuando com a requisição.`);
  return NextResponse.next(); // Permite que a requisição continue
}

// O matcher define quais rotas o middleware deve ser executado
export const config = {
  matcher: [
    // Exclui arquivos estáticos, imagens, e as rotas de API que já estão em PUBLIC_ROUTES
    // O matcher deve ser abrangente para pegar todas as rotas que podem ser subdomínios.
    // As exclusões dentro da função middleware são mais finas.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

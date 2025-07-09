import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Atenção: Isso desativa a verificação do ESLint durante o build de produção.
    // Use com cautela, pois pode introduzir problemas de qualidade de código.
    // É altamente recomendado resolver os erros do ESLint em vez de ignorá-los.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

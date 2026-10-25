import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Yalnızca `next dev` için: telefondan yerel ağ IP'siyle açıldığında geliştirme dosyaları engellenmesin.
  // Bilgisayarın Wi-Fi IP'si değişirse burayı güncelleyin.
  allowedDevOrigins: ['10.129.74.217'],
};

export default nextConfig;

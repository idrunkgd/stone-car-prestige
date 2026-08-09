import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build autonome pour un déploiement Docker/Coolify léger.
  output: "standalone",
  // Épingle la racine du projet (évite la confusion « multiple lockfiles »
  // et place la sortie standalone au bon endroit).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;

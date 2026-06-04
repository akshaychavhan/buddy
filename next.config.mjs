/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    // Better Auth 1.6.14's transitive kysely-adapter dist re-exports stale
    // kysely symbols (DEFAULT_MIGRATION_TABLE / _LOCK_TABLE) that break the
    // Next.js webpack bundle. We use Better Auth with the Prisma adapter
    // (not kysely), so marking better-auth as an external server package
    // tells Next to skip bundling and require() it at runtime — sidestepping
    // the import-error chain entirely.
    serverComponentsExternalPackages: ["better-auth"],
  },
};

export default nextConfig;

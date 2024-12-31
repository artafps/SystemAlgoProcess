/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: true,
    experimental: {
        appDir: true, // مطمئن شوید که App Router فعال است
    },
};

export default nextConfig;

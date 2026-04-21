/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.baboo.ma" },
      // Supabase Storage (pattern valable pour *.supabase.co)
      { protocol: "https", hostname: "*.supabase.co" },
      // Avatars OAuth (Google, Facebook)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      // Gravatar / autres CDN courants
      { protocol: "https", hostname: "gravatar.com" },
      { protocol: "https", hostname: "*.gravatar.com" },
      // CDN génériques utilisés par les agences (imgix, ibb, etc.)
      { protocol: "https", hostname: "*.imgix.net" },
      { protocol: "https", hostname: "i.ibb.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
        ],
      },
    ];
  },
};

export default nextConfig;

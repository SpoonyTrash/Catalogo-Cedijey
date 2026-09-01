import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                port: "",
                pathname: "/m1hqc5v/image/upload/**",
                search: "",
            },
        ],
    },
};

export default nextConfig;

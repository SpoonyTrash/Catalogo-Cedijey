import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    //    cacheComponents: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                port: "",
                pathname: "/im1hqc5v/image/upload/**",
                search: "",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/jywvgglr/image/upload/**",
            },
        ],
    },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	redirects: async () => {
		return [
			{
				source: "/",
				destination: "/dashboard",
				permanent: true,
			},
		];
	}
};

export default nextConfig;

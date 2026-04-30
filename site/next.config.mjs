import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    // String names keep options serializable for the MDX loader (required by Next).
    remarkPlugins: [["remark-math", { singleDollarTextMath: true }]],
    rehypePlugins: [["rehype-katex"]],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransition: true,
  },
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "6ke5oe60s0gkw6zi.public.blob.vercel-storage.com",
        pathname: "/**",
      },
    ],
  },
};

export default withMDX(nextConfig);

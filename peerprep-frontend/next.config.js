/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required for @xenova/transformers
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

module.exports = nextConfig;

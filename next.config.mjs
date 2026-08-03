import { join, resolve } from "path";

const cspHeader = `
  default-src 'self';

  script-src
    'self'
    'unsafe-eval'
    'unsafe-inline'
    https://js.stripe.com
    https://tpwdgt.com
    https://*.tpwdgt.com
    https://va.vercel-scripts.com
    https://*.travelpayouts.com
    https://*.kiwi.com;

  script-src-elem
    'self'
    'unsafe-inline'
    https://js.stripe.com
    https://tpwdgt.com
    https://*.tpwdgt.com
    https://va.vercel-scripts.com
    https://*.travelpayouts.com
    https://*.kiwi.com;

  style-src
    'self'
    'unsafe-inline'
    https:;

  img-src
    'self'
    blob:
    data:
    https:;

  font-src
    'self'
    data:
    https:;

  connect-src
    'self'
    https://tpwdgt.com
    https://*.tpwdgt.com
    https://va.vercel-scripts.com
    https://*.travelpayouts.com
    https://*.kiwi.com
    https://kiwi.com
    https://api.stripe.com
    https://sentry.avs.io
    https://*.avs.io
    https://www.apistp.com
    https://suggest.apistp.com
    https://*.apistp.com
    https://avsplow.com
    https://*.avsplow.com
    http://avsplow.com
    http://*.avsplow.com;

  frame-src
    'self'
    https://www.openstreetmap.org
    https://js.stripe.com
    https://hooks.stripe.com
    https://tpwdgt.com
    https://*.tpwdgt.com
    https://*.travelpayouts.com
    https://*.kiwi.com
    https://kiwi.com;

  form-action
    'self'
    https://tpwdgt.com
    https://*.travelpayouts.com
    https://*.kiwi.com
    https://kiwi.com;

  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
  worker-src 'self' blob:;
`;

/** @type {import("next").NextConfig} */

const helperDirName = join(process.cwd(), "lib/email/helpersHbs");

const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.hbs$/,
      use: [
        {
          loader: "handlebars-loader",
          options: {
            strict: true,
            noEscape: true,
            helperDirs: [resolve(helperDirName)],
          },
        },
      ],
    });

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "golob-travel-agency.vercel.app",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "www.airplane-pictures.net",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\s{2,}/g, " ").trim(),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */

// Normally empty. Set HAIYU_BASE at BUILD time only when the app is served
// behind a path-prefixing proxy (e.g. run-kit's /proxy/<port>/), so that asset
// URLs and our own API calls carry the prefix:
//
//   HAIYU_BASE=/proxy/8765 npm run build && npm start
//
// For the normal build — the one that runs on her laptop — leave it unset.
const base = process.env.HAIYU_BASE ?? "";

const nextConfig = {
  reactStrictMode: true,
  ...(base ? { assetPrefix: base } : {}),
  env: { NEXT_PUBLIC_HAIYU_BASE: base },
  // Everything runs on her laptop; nothing is sent anywhere except the
  // Claude API calls made server-side in app/api/claude/route.ts.
};
export default nextConfig;

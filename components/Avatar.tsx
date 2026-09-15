"use client";

// Haiyu's face.
//
// A chat head should look like someone, not like a settings icon. She cannot
// read the label, so the button has to say "there is a person here you can ask"
// by being a person. The collar is the phanek banding the rest of the app uses.

export function Avatar({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
      <defs>
        <clipPath id="haiyu-face-clip"><circle cx="32" cy="32" r="32" /></clipPath>
      </defs>
      <g clipPath="url(#haiyu-face-clip)">
        <rect width="64" height="64" fill="#F4E7D3" />

        {/* shoulders, with the textile banding from the rest of the app */}
        <path d="M8 64c0-11 10.7-17 24-17s24 6 24 17z" fill="#A93A2E" />
        <path d="M8.9 59.5h46.2c.5 1.4.8 2.9.9 4.5H8c.1-1.6.4-3.1.9-4.5z" fill="#9E6F16" />

        {/* hair behind */}
        <path d="M32 6c11.6 0 18.4 8.2 18.4 19.6 0 6.6-1.3 12.4-3.6 16.3-1 1.7-2.6.5-2.6-1.2V27.8H19.8v12.9c0 1.7-1.6 2.9-2.6 1.2-2.3-3.9-3.6-9.7-3.6-16.3C13.6 14.2 20.4 6 32 6z" fill="#241C2E" />

        {/* neck + face */}
        <path d="M27.4 39.6h9.2v9.6h-9.2z" fill="#E2A87E" />
        <ellipse cx="32" cy="30.6" rx="12.9" ry="14.6" fill="#F0C39A" />

        {/* fringe */}
        <path d="M19.3 26.4c.6-7.3 5.8-12.2 12.7-12.2s12.1 4.9 12.7 12.2c-3.6-2.4-5.6-5.1-6.3-7-2.2 3.1-8.5 6.1-19.1 7z" fill="#241C2E" />

        {/* eyes and smile — the whole point is that she reads it as friendly */}
        <ellipse cx="26.6" cy="31" rx="1.5" ry="1.9" fill="#241C2E" />
        <ellipse cx="37.4" cy="31" rx="1.5" ry="1.9" fill="#241C2E" />
        <path d="M27.4 36.8c1.3 1.6 3 2.4 4.6 2.4s3.3-.8 4.6-2.4" stroke="#8C3A2E"
          strokeWidth="1.7" strokeLinecap="round" fill="none" />
        <ellipse cx="22.4" cy="34.4" rx="2.1" ry="1.4" fill="#E79E86" opacity=".5" />
        <ellipse cx="41.6" cy="34.4" rx="2.1" ry="1.4" fill="#E79E86" opacity=".5" />
      </g>
    </svg>
  );
}

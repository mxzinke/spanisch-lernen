interface Props {
  size?: number
}

export function Logo({ size = 32 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      class="flex-shrink-0"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#c77b58" />
          <stop offset="100%" style="stop-color:#a65d57" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="96" fill="url(#logo-bg)" />
      <text
        x="256"
        y="340"
        font-family="Georgia, serif"
        font-size="280"
        font-weight="600"
        fill="#faf6f0"
        text-anchor="middle"
      >
        E
      </text>
      <text
        x="256"
        y="420"
        font-family="Georgia, serif"
        font-size="60"
        fill="#faf6f0"
        opacity="0.8"
        text-anchor="middle"
      >
        español
      </text>
    </svg>
  )
}

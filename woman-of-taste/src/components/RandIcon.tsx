interface RandIconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function RandIcon({ size = 20, className, style }: RandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="17"
        fontWeight="bold"
        fill="currentColor"
      >
        R
      </text>
      <line x1="7" y1="14" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

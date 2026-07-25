interface Props {
  size?: number;
  color?: string;
}

export default function StampCircleServer({ size = 100, color = "#5C3317" }: Props) {
  const r = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={r} cy={r} r={r - 4} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="6 3" />
      <circle cx={r} cy={r} r={r - 12} fill="none" stroke={color} strokeWidth="1" />
      <text x={r} y={r * 0.58} textAnchor="middle" fontSize={size * 0.1} fill={color} fontWeight="700" fontFamily="serif">
        PHILATELIC
      </text>
      <text x={r} y={r * 0.78} textAnchor="middle" fontSize={size * 0.09} fill={color} fontFamily="serif">
        BUREAU
      </text>
      <text x={r} y={r * 1.05} textAnchor="middle" fontSize={size * 0.1} fill={color} fontFamily="serif">
        KARNATAKA
      </text>
      <text x={r} y={r * 1.28} textAnchor="middle" fontSize={size * 0.085} fill={color} fontFamily="serif">
        INDIA POST
      </text>
    </svg>
  );
}

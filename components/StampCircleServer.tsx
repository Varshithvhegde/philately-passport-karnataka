interface Props { size?: number; color?: string; }

export default function StampCircleServer({ size = 120, color = "#4A2810" }: Props) {
  const r = size / 2;
  const outer = r - 4;
  const inner = r - 14;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        const x1 = r + (outer - 1.5) * Math.cos(a);
        const y1 = r + (outer - 1.5) * Math.sin(a);
        const x2 = r + (outer + 1.5) * Math.cos(a);
        const y2 = r + (outer + 1.5) * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1" />;
      })}
      <circle cx={r} cy={r} r={outer} fill="none" stroke={color} strokeWidth="2" />
      <circle cx={r} cy={r} r={inner} fill="none" stroke={color} strokeWidth="0.8" />
      <text x={r} y={r - inner * 0.44} textAnchor="middle" fontSize={size * 0.1} fill={color} fontWeight="bold" fontFamily="serif" letterSpacing="1.5">PHILATELIC</text>
      <text x={r} y={r - inner * 0.12} textAnchor="middle" fontSize={size * 0.088} fill={color} fontFamily="serif" letterSpacing="1">BUREAU</text>
      <text x={r} y={r + inner * 0.15} textAnchor="middle" fontSize={size * 0.1} fill={color} fontFamily="serif" letterSpacing="0.8">KARNATAKA</text>
      <text x={r} y={r + inner * 0.45} textAnchor="middle" fontSize={size * 0.085} fill={color} fontFamily="serif" letterSpacing="0.5">INDIA POST</text>
      <circle cx={r} cy={r + inner * 0.72} r={2.5} fill={color} opacity="0.5" />
    </svg>
  );
}

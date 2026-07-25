interface Props {
  visited: boolean;
  date?: string;
  size?: number;
}

export default function StampCircle({ visited, date, size = 100 }: Props) {
  const r = size / 2;
  const outer = r - 4;
  const inner = r - 14;

  if (!visited) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={outer} fill="none" stroke="#C4A35A" strokeWidth="2" strokeDasharray="5 4" opacity="0.5" />
        <circle cx={r} cy={r} r={inner} fill="none" stroke="#C4A35A" strokeWidth="1" strokeDasharray="3 3" opacity="0.28" />
        <text x={r} y={r - 4} textAnchor="middle" fontSize={size * 0.09} fill="#C4A35A" fillOpacity="0.4" fontFamily="serif" letterSpacing="1">STAMP</text>
        <text x={r} y={r + 8} textAnchor="middle" fontSize={size * 0.085} fill="#C4A35A" fillOpacity="0.3" fontFamily="serif">HERE</text>
      </svg>
    );
  }

  const d = date ? new Date(date + "T12:00:00") : new Date();
  const dy = d.getDate();
  const mo = d.toLocaleString("en-IN", { month: "short" }).toUpperCase();
  const yr = d.getFullYear();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* serrated outer ring */}
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const x1 = r + (outer - 1.5) * Math.cos(a);
        const y1 = r + (outer - 1.5) * Math.sin(a);
        const x2 = r + (outer + 1.5) * Math.cos(a);
        const y2 = r + (outer + 1.5) * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4A2810" strokeWidth="1" />;
      })}
      <circle cx={r} cy={r} r={outer} fill="none" stroke="#4A2810" strokeWidth="2" />
      <circle cx={r} cy={r} r={inner + 1} fill="none" stroke="#4A2810" strokeWidth="0.8" />
      <text x={r} y={r - inner * 0.44} textAnchor="middle" fontSize={size * 0.1} fill="#4A2810" fontWeight="bold" fontFamily="serif" letterSpacing="1.5">PHILATELIC</text>
      <text x={r} y={r - inner * 0.12} textAnchor="middle" fontSize={size * 0.088} fill="#4A2810" fontFamily="serif" letterSpacing="1">BUREAU</text>
      <text x={r} y={r + inner * 0.3} textAnchor="middle" fontSize={size * 0.22} fill="#4A2810" fontWeight="bold" fontFamily="serif">{dy}</text>
      <text x={r} y={r + inner * 0.58} textAnchor="middle" fontSize={size * 0.115} fill="#4A2810" fontFamily="serif" letterSpacing="0.8">{mo} {yr}</text>
      <text x={r} y={r + inner * 0.82} textAnchor="middle" fontSize={size * 0.082} fill="#7A3B0F" fontFamily="serif" letterSpacing="0.5">KARNATAKA</text>
    </svg>
  );
}

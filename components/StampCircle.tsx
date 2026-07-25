interface Props {
  visited: boolean;
  date?: string;
  size?: number;
}

export default function StampCircle({ visited, date, size = 100 }: Props) {
  const r = size / 2;

  if (!visited) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={r - 6} fill="none" stroke="#C4A35A" strokeWidth="2" strokeDasharray="6 4" />
        <circle cx={r} cy={r} r={r - 14} fill="none" stroke="#C4A35A80" strokeWidth="1" strokeDasharray="3 3" />
        <text x={r} y={r + 4} textAnchor="middle" fontSize={size * 0.12} fill="#C4A35A80" fontFamily="serif">
          UNCOLLECTED
        </text>
      </svg>
    );
  }

  const yr = date ? new Date(date + "T12:00:00").getFullYear() : new Date().getFullYear();
  const mo = date ? new Date(date + "T12:00:00").toLocaleString("en-IN", { month: "short" }).toUpperCase() : "";
  const dy = date ? new Date(date + "T12:00:00").getDate() : "";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={r} cy={r} r={r - 4} fill="none" stroke="#5C3317" strokeWidth="3" />
      <circle cx={r} cy={r} r={r - 12} fill="none" stroke="#5C3317" strokeWidth="1.5" />
      <text x={r} y={r * 0.6} textAnchor="middle" fontSize={size * 0.11} fill="#5C3317" fontWeight="bold" fontFamily="serif">
        PHILATELIC
      </text>
      <text x={r} y={r * 0.85} textAnchor="middle" fontSize={size * 0.1} fill="#5C3317" fontFamily="serif">
        BUREAU
      </text>
      <text x={r} y={r * 1.15} textAnchor="middle" fontSize={size * 0.22} fill="#5C3317" fontWeight="bold" fontFamily="serif">
        {dy}
      </text>
      <text x={r} y={r * 1.38} textAnchor="middle" fontSize={size * 0.13} fill="#5C3317" fontFamily="serif">
        {mo} {yr}
      </text>
      <circle cx={r} cy={r} r={r - 4} fill="none" stroke="#5C331730" strokeWidth="1" />
    </svg>
  );
}

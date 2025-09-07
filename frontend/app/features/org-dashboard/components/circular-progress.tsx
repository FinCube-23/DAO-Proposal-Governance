interface Props {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  color?: string;
}

export function CircularProgress({
  value,
  maxValue,
  size = 120,
  strokeWidth = 8,
  label,
  color = 'rgb(59, 130, 246)',
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / maxValue) * circumference;
  const percentage = Math.round((value / maxValue) * 100);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgb(55, 65, 81)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-white text-xl font-bold">
          {percentage}
          %
        </span>
        <span className="text-gray-400 text-xs text-center">{label}</span>
      </div>
    </div>
  );
}

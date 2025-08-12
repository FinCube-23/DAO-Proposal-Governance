interface Props {
  title: string;
  subtitle?: string;
  className?: string;
}

export function LineChart({ title, subtitle, className = '' }: Props) {
  return (
    <div className={`bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-sm ${className}`}>
      <div className="mb-6">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>

      <div className="relative h-40">
        <svg className="w-full h-full" viewBox="0 0 400 160">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="32" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 32" fill="none" stroke="rgb(55, 65, 81)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Area under curve */}
          <path
            d="M20,120 L60,80 L100,100 L140,60 L180,90 L220,70 L260,65 L300,55 L340,50 L340,160 L20,160 Z"
            fill="url(#gradient)"
            opacity="0.1"
          />

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Main line */}
          <polyline
            points="20,120 60,80 100,100 140,60 180,90 220,70 260,65 300,55 340,50"
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {[
            [20, 120],
            [60, 80],
            [100, 100],
            [140, 60],
            [180, 90],
            [220, 70],
            [260, 65],
            [300, 55],
            [340, 50],
          ].map(([x, y], index) => (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill="rgb(59, 130, 246)"
              className="hover:r-6 transition-all cursor-pointer"
            />
          ))}
        </svg>

        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-4">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
        </div>
      </div>
    </div>
  );
}

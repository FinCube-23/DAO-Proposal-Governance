import { Card, CardContent } from '../ui/card';

interface Props {
  data: { label: string; value: number; color: string }[];
  title: string;
  subtitle?: string;
}

export function BarChart({ data, title, subtitle }: Props) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-white text-lg font-semibold">{title}</h3>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>

        <div className="relative h-40">
          {/* Grid lines background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 160">
            <defs>
              <pattern id="bar-grid" width="40" height="32" patternUnits="userSpaceOnUse">
                <path d="M 0 0 L 40 0" fill="none" stroke="rgb(55, 65, 81)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bar-grid)" />
          </svg>

          {/* Bar chart content */}
          <div className="flex items-end justify-center space-x-8 h-full relative z-10">
            {data.map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative mb-3">
                  <div
                    className={`${item.color} rounded-t-lg transition-all duration-500 hover:opacity-80 relative`}
                    style={{
                      height: `${(item.value / maxValue) * 120}px`,
                      width: '48px',
                      minHeight: '20px',
                    }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                      {item.value}
                    </div>
                  </div>
                </div>
                <span className="text-gray-400 text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

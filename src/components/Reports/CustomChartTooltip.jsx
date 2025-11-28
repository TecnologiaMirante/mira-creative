//src/components/reports/CustomChartTooltip.jsx

export const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 p-3 rounded-lg shadow-xl">
        <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-xs text-slate-500"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="font-medium">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

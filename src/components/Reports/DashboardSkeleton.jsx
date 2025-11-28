//src/components/reports/DashboardSkeleton.jsx

export const DashboardSkeleton = () => (
  <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen animate-pulse">
    <div className="h-10 w-48 bg-slate-200 rounded mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 bg-slate-200 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-80 bg-slate-200 rounded-xl" />
      <div className="h-80 bg-slate-200 rounded-xl" />
    </div>
  </div>
);

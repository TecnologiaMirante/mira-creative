//src/components/reports/DashboardSkeleton.jsx

export const DashboardSkeleton = () => (
  <div className="min-h-screen animate-pulse space-y-8 bg-slate-50/60 p-6 sm:p-8">
    <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <div className="mb-3 h-4 w-28 rounded-full bg-slate-200" />
      <div className="h-10 w-56 rounded-2xl bg-slate-200" />
      <div className="mt-3 h-4 w-72 rounded-full bg-slate-100" />
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-36 rounded-[28px] border border-slate-200/70 bg-white/80"
        />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="h-80 rounded-[28px] border border-slate-200/70 bg-white/80" />
      <div className="h-80 rounded-[28px] border border-slate-200/70 bg-white/80" />
    </div>
  </div>
);

import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white border border-warm-200 rounded-2xl p-6 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-slate-200 rounded w-2/3"></div>
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white border border-warm-200 rounded-2xl p-6 animate-pulse h-80 flex flex-col justify-between">
    <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
    <div className="flex-1 w-full flex items-end gap-4">
      <div className="bg-slate-200 rounded-t h-1/4 flex-1"></div>
      <div className="bg-slate-200 rounded-t h-2/3 flex-1"></div>
      <div className="bg-slate-200 rounded-t h-1/2 flex-1"></div>
      <div className="bg-slate-200 rounded-t h-3/4 flex-1"></div>
      <div className="bg-slate-200 rounded-t h-5/6 flex-1"></div>
      <div className="bg-slate-200 rounded-t h-1/3 flex-1"></div>
      <div className="bg-slate-200 rounded-t h-1/2 flex-1"></div>
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="bg-white border border-warm-200 rounded-2xl p-6 animate-pulse space-y-4">
    <div className="h-4 bg-slate-200 rounded w-1/4 mb-6"></div>
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex justify-between items-center py-2 border-b border-warm-100 last:border-0">
        <div className="flex items-center gap-3 w-1/2">
          <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="h-2 bg-slate-200 rounded w-1/3"></div>
          </div>
        </div>
        <div className="h-4 bg-slate-200 rounded w-16"></div>
      </div>
    ))}
  </div>
);

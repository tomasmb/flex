'use client';

/**
 * Property Health Quadrant Widget
 * Displays 2×2 grid of property health status
 * Based on spec lines 528-543
 */

import { useRouter } from 'next/navigation';

interface PropertyHealthWidgetProps {
  quadrants: {
    wellManaged: number;
    screeningIssue: number;
    propertyIssue: number;
    systemicFailure: number;
  };
}

export function PropertyHealthWidget({ quadrants }: PropertyHealthWidgetProps) {
  const router = useRouter();

  const handleQuadrantClick = (quadrant: string) => {
    router.push(`/dashboard?healthQuadrant=${quadrant}`);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-[#333333] mb-4">Property Health Overview</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Well-managed (top-left) */}
        <button
          onClick={() => handleQuadrantClick('well-managed')}
          className="p-6 rounded-xl border-2 border-[#25D366] bg-green-50/50 hover:bg-green-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">✅</span>
            <h4 className="font-semibold text-[#333333]">Well-managed</h4>
          </div>
          <p className="text-3xl font-bold text-[#25D366] mb-1">{quadrants.wellManaged}</p>
          <p className="text-xs text-[#6B7280]">High property & guest quality</p>
        </button>

        {/* Screening issue (top-right) */}
        <button
          onClick={() => handleQuadrantClick('screening-issue')}
          className="p-6 rounded-xl border-2 border-orange-400 bg-orange-50/50 hover:bg-orange-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠️</span>
            <h4 className="font-semibold text-[#333333]">Screening issue</h4>
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-1">{quadrants.screeningIssue}</p>
          <p className="text-xs text-[#6B7280]">Good property, poor guests</p>
        </button>

        {/* Property issue (bottom-left) */}
        <button
          onClick={() => handleQuadrantClick('property-issue')}
          className="p-6 rounded-xl border-2 border-orange-400 bg-orange-50/50 hover:bg-orange-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⚠️</span>
            <h4 className="font-semibold text-[#333333]">Property issue</h4>
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-1">{quadrants.propertyIssue}</p>
          <p className="text-xs text-[#6B7280]">Good guests, poor property</p>
        </button>

        {/* Systemic failure (bottom-right) */}
        <button
          onClick={() => handleQuadrantClick('systemic-failure')}
          className="p-6 rounded-xl border-2 border-red-500 bg-red-50/50 hover:bg-red-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🚨</span>
            <h4 className="font-semibold text-[#333333]">Systemic failure</h4>
          </div>
          <p className="text-3xl font-bold text-red-600 mb-1">{quadrants.systemicFailure}</p>
          <p className="text-xs text-[#6B7280]">URGENT: Both need attention</p>
        </button>
      </div>

      <p className="text-xs text-[#6B7280] mt-4 text-center">
        Click a quadrant to filter properties by health status
      </p>
    </div>
  );
}

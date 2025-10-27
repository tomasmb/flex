'use client';

/**
 * Collapsible Health Status Guide
 * Explains property health thresholds based on research
 * Following UX best practice: Progressive disclosure pattern
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

export function HealthStatusGuide() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              Understanding Health Status
            </h3>
            <p className="text-sm text-gray-600">
              Research-backed thresholds from Airbnb, Booking.com
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-5 border-t border-gray-100">
          {/* Introduction */}
          <div className="pt-4">
            <p className="text-sm text-gray-700 mb-3">
              Card colors show <strong>worst-case scenario</strong> - if either metric (property or guest quality) needs attention, the card is flagged.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-1.5">Property Rating</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>≥4.7 = Excellent</div>
                  <div>4.0-4.69 = Monitor</div>
                  <div>&lt;4.0 = Critical</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-700 mb-1.5">Guest Quality</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <div>≥4.5 = Excellent</div>
                  <div>4.0-4.49 = Warning</div>
                  <div>&lt;4.0 = Critical</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Color Legend */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-gray-900">Status Colors</h3>

            {/* Red - CRITICAL */}
            <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500">
              <h4 className="text-sm font-semibold text-red-900">Red - Critical</h4>
              <p className="text-xs text-red-700 mt-0.5">
                Property &lt;4.0 or Guest &lt;4.0 or 1+ properties at risk
              </p>
              <p className="text-xs text-red-600 mt-1">
                Urgent action needed to fix property or tighten screening
              </p>
            </div>

            {/* Orange - WARNING */}
            <div className="p-3 rounded-lg bg-orange-50 border-l-4 border-orange-500">
              <h4 className="text-sm font-semibold text-orange-900">Orange - Guest Screening</h4>
              <p className="text-xs text-orange-700 mt-0.5">
                Guest quality 4.0-4.49 needs attention
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Review acceptance criteria and screening process
              </p>
            </div>

            {/* Yellow - MONITOR */}
            <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-500">
              <h4 className="text-sm font-semibold text-yellow-900">Yellow - Monitor</h4>
              <p className="text-xs text-yellow-700 mt-0.5">
                Property 4.0-4.69, below premium tier
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                Work toward ≥4.7 for competitive advantage
              </p>
            </div>

            {/* Green - EXCELLENT */}
            <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
              <h4 className="text-sm font-semibold text-green-900">Green - Excellent</h4>
              <p className="text-xs text-green-700 mt-0.5">
                Property ≥4.7 and Guests ≥4.5
              </p>
              <p className="text-xs text-green-600 mt-1">
                Premium performance - maintain standards
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

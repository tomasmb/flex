'use client';

/**
 * Rating Time Series and Distribution Charts
 * Implements visualization requirements from spec lines 460-483
 */

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface TimeSeriesDataPoint {
  month: string;
  guestToHost: number;
  hostToGuest: number;
}

interface DistributionData {
  rating: string;
  guestToHost: number;
  hostToGuest: number;
}

interface RatingChartsProps {
  timeSeriesData: TimeSeriesDataPoint[];
  distributionData: DistributionData[];
}

export function RatingCharts({ timeSeriesData, distributionData }: RatingChartsProps) {
  return (
    <div className="space-y-6">
      {/* Time Series Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-[#333333] mb-4">Rating Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
            <YAxis domain={[0, 10]} stroke="#6B7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Line
              type="monotone"
              dataKey="guestToHost"
              stroke="#284E4C"
              strokeWidth={2}
              name="Guest-to-Host Rating"
              dot={{ fill: '#284E4C', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="hostToGuest"
              stroke="#D97706"
              strokeWidth={2}
              name="Host-to-Guest Rating"
              dot={{ fill: '#D97706', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-[#6B7280] mt-2">
          Track property performance and guest quality trends month-over-month
        </p>
      </div>

      {/* Rating Distribution Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-[#333333] mb-4">Rating Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={distributionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="rating" stroke="#6B7280" style={{ fontSize: '12px' }} />
            <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="guestToHost" fill="#284E4C" name="Guest-to-Host" radius={[4, 4, 0, 0]} />
            <Bar dataKey="hostToGuest" fill="#D97706" name="Host-to-Guest" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-[#6B7280] mt-2">
          Compare rating distributions to identify if you're harsher on guests than they are on you
        </p>
      </div>
    </div>
  );
}

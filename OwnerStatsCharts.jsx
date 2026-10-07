import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import { EmptyState } from './EmptyState';
import { getBookingStatusLabelKey } from '../utils/display';
import { formatCompactCurrency, formatCompactNumber } from '../utils/formatters';

// Chart surface + status tokens: green/amber/red pass the dark lightness band
// (0.48-0.67), CVD (adjacent dE 16.2) and contrast (>=3:1) vs the #111827 card
// surface. Slate is a deliberate desaturated "neutral" (cancelled = nothing
// happened, not a failure state) and always carries its own text label, never
// color alone. No hover tooltips or animation — every value is static/direct-labeled.
export const CHART_SURFACE = '#111827';
const GRID_LINE = 'rgba(255,255,255,0.08)';
const AXIS_INK = '#6b7280';
export const STATUS_COLORS = {
  confirmed: '#16a34a',
  pending: '#d97706',
  rejected: '#dc2626',
  cancelled: '#64748b',
};
const STATUS_ORDER = ['confirmed', 'pending', 'rejected', 'cancelled'];

export const buildStatusData = (stats, t) => {
  if (!stats) return [];

  const counts = {
    confirmed: stats.confirmedCount || 0,
    pending: stats.pendingCount || 0,
    rejected: stats.rejectedCount || 0,
    cancelled: stats.cancelledCount || 0,
  };
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0) || 1;

  return STATUS_ORDER.filter((key) => counts[key] > 0).map((key) => ({
    key,
    label: t(getBookingStatusLabelKey(key)),
    value: counts[key],
    percent: Math.round((counts[key] / total) * 100),
    color: STATUS_COLORS[key],
  }));
};

const niceCeiling = (value) => {
  const base = Number(value) || 0;
  if (base <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(base));
  return Math.ceil(base / magnitude) * magnitude;
};

function EndLabelDot(props) {
  const { cx, cy, index, dataLength, value } = props;

  if (cx == null || cy == null) return null;

  const isLast = index === dataLength - 1;

  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill={STATUS_COLORS.confirmed} stroke={CHART_SURFACE} strokeWidth={2} />
      {isLast ? (
        <text x={cx} y={cy - 14} textAnchor="middle" className="fill-white text-[12px] font-semibold">
          {formatCompactCurrency(value)}
        </text>
      ) : null}
    </g>
  );
}

export function BookingStatusDoughnut({ statusData, total, t }) {
  if (!total) {
    return <EmptyState title={t('common.noData')} description={t('empty.noOwnerBookingsDescription')} />;
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={statusData.length > 1 ? 3 : 0}
              cornerRadius={6}
              stroke={CHART_SURFACE}
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {statusData.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="heading-font text-3xl font-semibold text-white">{formatCompactNumber(total)}</p>
          <p className="text-xs uppercase tracking-[0.14em] text-gray-500">{t('reportsPage.totalBookings')}</p>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-3">
        {statusData.map((entry) => (
          <li key={entry.key} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 text-gray-300">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="truncate">{entry.label}</span>
            </span>
            <span className="shrink-0 font-medium text-white">
              {entry.value}
              <span className="ml-1.5 text-xs font-normal text-gray-500">{entry.percent}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function IncomeTrendChart({ data, t }) {
  if (!data.length) {
    return <EmptyState title={t('common.noData')} description={t('reportsPage.bookingTrend')} />;
  }

  const yMax = niceCeiling(Math.max(...data.map((item) => item.income)) * 1.2);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={GRID_LINE} vertical={false} strokeDasharray="0" />
          <XAxis
            dataKey="month"
            stroke={AXIS_INK}
            tickLine={false}
            axisLine={{ stroke: GRID_LINE }}
            tick={{ fill: AXIS_INK, fontSize: 12 }}
            padding={{ left: 12, right: 12 }}
          />
          <YAxis
            domain={[0, yMax]}
            allowDecimals={false}
            stroke={AXIS_INK}
            tickLine={false}
            axisLine={{ stroke: GRID_LINE }}
            tick={{ fill: AXIS_INK, fontSize: 12 }}
            tickFormatter={formatCompactCurrency}
            width={64}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke={STATUS_COLORS.confirmed}
            strokeWidth={2}
            fill={STATUS_COLORS.confirmed}
            fillOpacity={0.1}
            dot={(props) => (
              <EndLabelDot key={`dot-${props.index}`} {...props} dataLength={data.length} value={props.payload.income} />
            )}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

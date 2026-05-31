"use client";

interface ActivityHeatmapProps {
  data: Array<{ date: string; amount: number }>;
}

const COLORS = ['#F1F5F9', '#DBEAFE', '#93C5FD', '#4F6EF7', '#1E40AF'];

function getColorIndex(amount: number): number {
  if (amount <= 0) return 0;
  if (amount === 1) return 1;
  if (amount <= 3) return 2;
  if (amount <= 6) return 3;
  return 4;
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const dayMap = new Map<string, number>();
  data.forEach((d) => {
    dayMap.set(d.date, d.amount);
  });

  // Generate last 12 weeks (84 days) — align so Sunday is the last day
  const totalDays = 84;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the most recent Sunday (day 0)
  const endDate = new Date(today);
  const dayOfWeek = endDate.getDay(); // 0=Sun
  // If today is not Sunday, move back to the previous Sunday
  endDate.setDate(endDate.getDate() - dayOfWeek);

  // Start date = endDate - (totalDays - 1) days to get exactly 84 days
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - (totalDays - 1));

  // Build array of day objects (chronological)
  const days: Array<{
    date: string;
    amount: number;
    colorIndex: number;
    weekday: number; // 0=Sun
    weekIndex: number;
    month: string;
    showMonth: boolean;
    dateStr: string;
  }> = [];

  const monthLabels: Array<{ weekIndex: number; label: string }> = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const amount = dayMap.get(dateStr) || 0;

    const weekday = d.getDay(); // 0=Sun
    const weekIndex = Math.floor(i / 7);

    // Track month labels: show at the first column where the month changes
    const currentMonth = d.toLocaleString('en-US', { month: 'short' });
    const prevDate = new Date(d);
    prevDate.setDate(prevDate.getDate() - 7);
    const prevMonth = prevDate.toLocaleString('en-US', { month: 'short' });

    if (weekday === 0 && currentMonth !== prevMonth) {
      monthLabels.push({ weekIndex, label: currentMonth });
    }

    days.push({
      date: dateStr,
      amount,
      colorIndex: getColorIndex(amount),
      weekday,
      weekIndex,
      month: currentMonth,
      showMonth: false,
      dateStr,
    });
  }

  // Also add the first month label if not already added
  if (monthLabels.length === 0 || monthLabels[0].weekIndex > 0) {
    monthLabels.unshift({
      weekIndex: 0,
      label: days[0].month,
    });
  }

  // Group by week column (each column = one week, rows = Sun..Sat)
  const weeks: Array<typeof days> = [];
  for (let w = 0; w < 12; w++) {
    weeks.push(days.filter((d) => d.weekIndex === w));
  }

  // Row order: Sunday (0) to Saturday (6) — but GitHub shows Mon on top, Sun at bottom
  const rowOrder = [0, 1, 2, 3, 4, 5, 6]; // Sun..Sat

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-[18px]">
      <h3 className="text-base font-semibold text-[#111827] mb-3">
        Daily Activity
      </h3>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels row */}
          <div className="flex mb-1" style={{ paddingLeft: '36px' }}>
            {Array.from({ length: 12 }, (_, wi) => {
              const label = monthLabels.find((m) => m.weekIndex === wi);
              return (
                <div
                  key={wi}
                  className="text-2xs text-[#9CA3AF] font-medium"
                  style={{ width: '14px', marginRight: '3px' }}
                >
                  {label ? label.label : ''}
                </div>
              );
            })}
          </div>

          {/* Grid: rows = days of week, columns = weeks */}
          <div className="flex">
            {/* Day-of-week labels */}
            <div className="flex flex-col mr-1 gap-[3px]">
              {rowOrder.map((dow) => (
                <div
                  key={dow}
                  className="text-2xs text-[#9CA3AF] leading-none flex items-center"
                  style={{ height: '14px' }}
                >
                  {DAY_LABELS[dow]}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-[3px]">
              {Array.from({ length: 12 }, (_, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {rowOrder.map((dow) => {
                    const day = days.find(
                      (d) => d.weekIndex === wi && d.weekday === dow
                    );
                    if (!day) {
                      return (
                        <div
                          key={dow}
                          className="rounded-[3px]"
                          style={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: COLORS[0],
                          }}
                        />
                      );
                    }
                    return (
                      <div
                        key={`${wi}-${dow}`}
                        className="group relative"
                      >
                        <div
                          className="rounded-[3px] cursor-pointer transition-all duration-150 hover:ring-2 hover:ring-[#111827]/20 hover:ring-offset-1"
                          style={{
                            width: '14px',
                            height: '14px',
                            backgroundColor: COLORS[day.colorIndex],
                          }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-[6px] bg-[#111827] text-white text-2xs leading-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                          {day.amount > 0
                            ? `${day.date}: ${day.amount} transaction${day.amount !== 1 ? 's' : ''}`
                            : `${day.date}: No activity`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end mt-2 gap-1">
            <span className="text-2xs text-[#9CA3AF]">Less</span>
            {COLORS.map((color, i) => (
              <div
                key={i}
                className="rounded-[2px]"
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: color,
                }}
              />
            ))}
            <span className="text-2xs text-[#9CA3AF]">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

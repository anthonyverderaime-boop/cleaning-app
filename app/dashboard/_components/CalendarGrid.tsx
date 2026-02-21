"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CalendarDayCard, { type CalendarDayCardItem } from "./CalendarDayCard";
import DayDetailsSheet, { type DayDetails } from "./DayDetailsSheet";

export type CalendarDayItem = CalendarDayCardItem & {
  completedAt?: string | null;
  checklistHref?: string | null;
  historyHref?: string | null;
};

export default function CalendarGrid({
  monthLabel,
  weekdayLabels,
  leadingBlankCount,
  days,
  claimAction,
  unclaimAction,
  undoCompleteAction,
}: {
  monthLabel: string;
  weekdayLabels: string[];
  leadingBlankCount: number;
  days: CalendarDayItem[];
  claimAction: (formData: FormData) => Promise<void>;
  unclaimAction: (formData: FormData) => Promise<void>;
  undoCompleteAction: (formData: FormData) => Promise<void>;
}) {
  const [selectedDay, setSelectedDay] = useState<CalendarDayItem | null>(null);

  const weeks = useMemo(() => {
    const chunked: CalendarDayItem[][] = [];
    let week: CalendarDayItem[] = [];
    days.forEach((day, idx) => {
      week.push(day);
      if ((idx + leadingBlankCount + 1) % 7 === 0) {
        chunked.push(week);
        week = [];
      }
    });
    if (week.length > 0) chunked.push(week);
    return chunked;
  }, [days, leadingBlankCount]);

  if (!days.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No days available</CardTitle>
          <CardDescription>Calendar data is not available for this month.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <section className="hidden space-y-3 md:block">
        <div className="grid grid-cols-7 gap-3">
          {weekdayLabels.map((weekday) => (
            <p key={weekday} className="px-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
              {weekday}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {Array.from({ length: leadingBlankCount }).map((_, index) => (
            <div key={`blank-${index}`} className="h-[152px] rounded-xl" />
          ))}

          {days.map((day) => (
            <CalendarDayCard key={day.dayKey} day={day} onClick={() => setSelectedDay(day)} />
          ))}
        </div>
      </section>

      <section className="space-y-4 md:hidden">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{monthLabel} agenda</CardTitle>
            <CardDescription>Tap any day to view actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            {weeks.map((week, index) => (
              <div key={`week-${index}`} className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Week {index + 1}</p>
                {week.map((day) => (
                  <CalendarDayCard key={day.dayKey} day={day} onClick={() => setSelectedDay(day)} />
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <DayDetailsSheet
        day={selectedDay as DayDetails | null}
        open={Boolean(selectedDay)}
        onOpenChange={(open) => {
          if (!open) setSelectedDay(null);
        }}
        claimAction={claimAction}
        unclaimAction={unclaimAction}
        undoCompleteAction={undoCompleteAction}
      />
    </>
  );
}

export function CalendarGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

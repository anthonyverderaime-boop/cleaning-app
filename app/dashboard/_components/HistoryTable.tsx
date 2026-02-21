"use client";

import { useMemo, useState } from "react";
import { Clock3, Image as ImageIcon, ListChecks, UserRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type HistoryRow = {
  day: string;
  worker: string;
  status: "Completed";
  completedAt: string;
  completedTasks: number;
  totalTasks: number;
  photosCount: number;
  checkedItems: string[];
};

export default function HistoryTable({ rows }: { rows: HistoryRow[] }) {
  const [workerFilter, setWorkerFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRow, setSelectedRow] = useState<HistoryRow | null>(null);

  const workers = useMemo(() => Array.from(new Set(rows.map((row) => row.worker))), [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (workerFilter !== "all" && row.worker !== workerFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      if (startDate && row.day < startDate) return false;
      if (endDate && row.day > endDate) return false;
      return true;
    });
  }, [rows, workerFilter, statusFilter, startDate, endDate]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid grid-cols-1 gap-4 lg:gap-6 p-4 sm:p-6 md:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Start date</span>
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">End date</span>
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Worker</span>
            <Select value={workerFilter} onValueChange={setWorkerFilter}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="All workers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All workers</SelectItem>
                {workers.map((worker) => (
                  <SelectItem key={worker} value={worker}>
                    {worker}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Status</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Completed time</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead>Photos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow
                    key={`${row.day}-${row.worker}`}
                    className="cursor-pointer hover:bg-zinc-50"
                    onClick={() => setSelectedRow(row)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedRow(row);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <TableCell className="font-medium text-zinc-900">{row.day}</TableCell>
                    <TableCell className="text-zinc-600">{row.worker}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-zinc-600">{new Date(row.completedAt).toLocaleString("en-US")}</TableCell>
                    <TableCell className="text-zinc-600">{row.completedTasks}/{row.totalTasks}</TableCell>
                    <TableCell className="text-zinc-600">{row.photosCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-zinc-600">No cleanings found for the selected filters.</div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRow(null)}>
        <DialogContent>
          {selectedRow ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-zinc-900">Cleaning detail - {selectedRow.day}</h3>
                  <p className="text-sm text-zinc-600">{selectedRow.worker}</p>
                </div>
                <Button type="button" variant="outline" size="icon" onClick={() => setSelectedRow(null)}>
                  <X size={14} />
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="space-y-2 p-4">
                    <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      <ListChecks size={12} />
                      Checklist items
                    </p>
                    <ul className="space-y-1 text-sm text-zinc-700">
                      {selectedRow.checkedItems.map((item, index) => (
                        <li key={`${item}-${index}`}>[x] {item}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-2 p-4 text-sm text-zinc-600">
                    <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
                      <ImageIcon size={12} />
                      Photos
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <Clock3 size={14} />
                      Photo gallery placeholder ({selectedRow.photosCount} items)
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <UserRound size={14} />
                      Worker: {selectedRow.worker}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

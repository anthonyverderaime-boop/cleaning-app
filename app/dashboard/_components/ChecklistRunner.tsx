"use client";

import { useMemo, useState } from "react";
import { Camera, CheckCircle2, RotateCcw, Save, StickyNote, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import StickyActionBar from "./StickyActionBar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ChecklistRunnerProps = {
  day: string;
  items: string[];
  initialCheckedItems: string[];
  saveAction: (formData: FormData) => Promise<void>;
};

export default function ChecklistRunner({ day, items, initialCheckedItems, saveAction }: ChecklistRunnerProps) {
  const initialRecord = useMemo(() => {
    const record: Record<string, boolean> = {};
    initialCheckedItems.forEach((item) => {
      record[item] = true;
    });
    return record;
  }, [initialCheckedItems]);

  const [checked, setChecked] = useState<Record<string, boolean>>(initialRecord);
  const [confirmComplete, setConfirmComplete] = useState(false);

  const completedCount = useMemo(() => items.filter((item) => checked[item]).length, [items, checked]);
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  function toggle(item: string) {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  }

  function resetAll() {
    setChecked({});
  }

  return (
    <form action={saveAction} className="space-y-6">
      <input type="hidden" name="day" value={day} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Task run</CardTitle>
          <CardDescription>{completedCount}/{items.length} complete</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          <Progress value={progress} />
          <p className="text-sm text-zinc-600">Progress: {progress}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {items.length === 0 ? <p className="text-sm text-zinc-600">No tasks configured.</p> : null}

          {items.map((item, index) => (
            <div key={`${item}-${index}`} className="rounded-lg border border-zinc-200 p-4 transition hover:bg-zinc-50">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`task-${index}`}
                  name="checked"
                  value={item}
                  checked={Boolean(checked[item])}
                  onCheckedChange={() => toggle(item)}
                  className="mt-1 border-zinc-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <label htmlFor={`task-${index}`} className={checked[item] ? "text-sm text-zinc-500 line-through" : "text-sm text-zinc-900"}>
                    {item}
                  </label>
                  <TooltipProvider delayDuration={100}>
                    <div className="flex flex-wrap gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" variant="outline" size="icon" aria-label={`Add note for ${item}`}>
                            <StickyNote size={12} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>Add note</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type="button" variant="outline" size="icon" aria-label={`Add photo for ${item}`}>
                            <Camera size={12} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent sideOffset={8}>Add photo</TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <StickyActionBar>
        <Button type="submit" name="intent" value="save">
          <Save size={14} />
          Save progress
        </Button>
        <Button type="button" variant="secondary" onClick={resetAll}>
          <RotateCcw size={14} />
          Reset
        </Button>
        <Button type="button" variant="destructive" onClick={() => setConfirmComplete(true)}>
          <CheckCircle2 size={14} />
          Mark complete
        </Button>
      </StickyActionBar>

      <Dialog open={confirmComplete} onOpenChange={setConfirmComplete}>
        <DialogContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-zinc-900">Mark cleaning complete?</h3>
              <p className="text-sm text-zinc-600">This will save a completion record for {day} in History.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setConfirmComplete(false)}>
                <X size={14} />
                Cancel
              </Button>
              <Button type="submit" variant="destructive" name="intent" value="complete">
                Confirm complete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}

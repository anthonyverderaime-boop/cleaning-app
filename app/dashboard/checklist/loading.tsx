import { PageHeaderSkeleton, TableSkeleton } from "../_components/LoadingSkeletons";

export default function ChecklistLoading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <PageHeaderSkeleton />
        <TableSkeleton />
        <TableSkeleton />
      </div>
    </div>
  );
}

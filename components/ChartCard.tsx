type ChartCardProps = {
  title: string;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
};

export default function ChartCard({
  title,
  isEmpty,
  emptyMessage,
  children,
}: ChartCardProps) {
  return (
    <div className="rounded-2xl bg-white p-6 text-left shadow-lg shadow-zinc-900/5">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      {isEmpty ? (
        <div className="mt-6 flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50">
          <p className="max-w-xs text-center text-sm text-zinc-400">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="mt-4 h-64">{children}</div>
      )}
    </div>
  );
}

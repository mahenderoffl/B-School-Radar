export default function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-4 py-10 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}

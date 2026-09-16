// frontend/src/components/interview/Transcript.tsx
interface Props {
  transcript: string;
  onChange: (value: string) => void;
  listening?: boolean;
}

export default function Transcript({
  transcript,
  onChange,
  listening = false,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-inner">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Live Transcript</h3>
        {listening ? (
          <span className="flex items-center gap-2 text-xs font-semibold text-rose-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
            Listening...
          </span>
        ) : (
          <span className="text-xs text-slate-500">Idle</span>
        )}
      </div>

      <textarea
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          listening
            ? "Speak now — your words appear here live..."
            : "Your answer will appear here when you start speaking..."
        }
        className="min-h-[160px] w-full resize-y rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-cyan-500/50"
      />

      <p className="mt-2 text-[11px] text-slate-500">
        You can edit the transcript before submitting.
      </p>
    </div>
  );
}
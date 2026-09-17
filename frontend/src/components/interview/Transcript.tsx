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
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Live Transcript</h3>
        {listening ? (
          <span className="text-xs text-rose-400 animate-pulse">Listening...</span>
        ) : (
          <span className="text-xs text-slate-500">Idle — you can type here</span>
        )}
      </div>
      <textarea
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          listening
            ? "Speak now — words appear here..."
            : "Type your answer here if mic is unavailable..."
        }
        className="min-h-[160px] w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-200 outline-none"
      />
    </div>
  );
}
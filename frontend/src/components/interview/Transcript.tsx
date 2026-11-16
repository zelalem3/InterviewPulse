interface Props {
  transcript: string;
  onChange: (value: string) => void;
  listening?: boolean;
  recognitionSupported?: boolean;
}

export default function Transcript({
  transcript,
  onChange,
  listening = false,
  recognitionSupported = true,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Live Transcript</h3>
        {listening ? (
          <span className="text-xs text-rose-400 animate-pulse">Listening...</span>
        ) : !recognitionSupported ? (
          <span className="text-xs text-amber-300">Type your answer</span>
        ) : (
          <span className="text-xs text-slate-500">Idle — you can type here</span>
        )}
      </div>
      {!recognitionSupported && (
        <p className="mb-3 text-xs text-amber-300">
          This browser does not provide speech-to-text. Use a browser with Web
          Speech API support, or type your answer below.
        </p>
      )}
      <textarea
        value={transcript}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          listening
            ? "Speak now — words appear here..."
            : !recognitionSupported
              ? "Type your answer here..."
              : "Type your answer here if mic is unavailable..."
        }
        className="min-h-[160px] w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-200 outline-none"
      />
    </div>
  );
}
interface Props {
  answering: boolean;
  listening: boolean;
  onStart: () => void;
  onStop: () => void;
  onNext: () => void;
  canSubmit: boolean;
  disabled?: boolean;
}

export default function Controls({
  answering,
  listening,
  onStart,
  onStop,
  onNext,
  canSubmit,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-wrap gap-4 justify-center items-center">
      {!answering ? (
        <button
          type="button"
          onClick={onStart}
          disabled={disabled}
          className="rounded-lg bg-green-600 px-6 py-3 text-white font-semibold disabled:opacity-50"
        >
          Start Answer
        </button>
      ) : (
        <button
          type="button"
          onClick={onStop}
          className="rounded-lg bg-red-600 px-6 py-3 text-white font-semibold"
        >
          Stop Answer
        </button>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={disabled || answering || !canSubmit}
        className="rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold disabled:opacity-50"
      >
        Submit & Next
      </button>

      {listening && (
        <span className="animate-pulse text-red-500 text-sm font-semibold">
          Listening...
        </span>
      )}
    </div>
  );
}
import type { RefCallback } from "react";

interface Props {
  videoRef: RefCallback<HTMLVideoElement | null>;
  loading: boolean;
  error: string;
}

export default function Camera({ videoRef, loading, error }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-10 text-center text-slate-400">
        Initializing camera...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-rose-950/40 border border-rose-900/60 p-6 text-rose-300 text-sm">
        <strong>Camera Error:</strong> {error}
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="w-full aspect-video rounded-xl bg-black object-cover"
    />
  );
}
import { RefObject } from "react";

interface Props {
    videoRef: RefObject<HTMLVideoElement | null>;
    loading: boolean;
    error: string;
}

export default function Camera({
    videoRef,
    loading,
    error
}: Props) {

    if (loading) {
        return (
            <div className="rounded-lg bg-gray-100 p-10 text-center">
                Initializing camera...
            </div>
        );
    }


    if (error) {
        return (
            <div className="rounded-lg bg-red-100 p-5 text-red-700">
                Camera Error: {error}
            </div>
        );
    }


    return (
        <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="
                w-full
                rounded-xl
                bg-black
            "
        />
    );
}
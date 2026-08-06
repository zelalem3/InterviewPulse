import { useEffect, useRef, useState } from "react";


export default function useCamera() {

    const videoRef = useRef<HTMLVideoElement | null>(null);

    const streamRef = useRef<MediaStream | null>(null);


    const [stream, setStream] = useState<MediaStream | null>(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [hasAudio, setHasAudio] = useState(false);



    useEffect(() => {


        const initializeCamera = async () => {


            try {


                const devices =
                    await navigator.mediaDevices.enumerateDevices();


                console.log(
                    "Available devices:",
                    devices
                );


                const microphoneExists =
                    devices.some(
                        device =>
                            device.kind === "audioinput"
                    );


                console.log(
                    "Microphone available:",
                    microphoneExists
                );



                const mediaStream =
                    await navigator.mediaDevices.getUserMedia({

                        video: {

                            width: {
                                ideal: 1280
                            },

                            height: {
                                ideal: 720
                            },

                            facingMode: "user"

                        },


                        audio: microphoneExists

                    });



                streamRef.current = mediaStream;


                setStream(mediaStream);



                const audioAvailable =
                    mediaStream
                        .getAudioTracks()
                        .length > 0;


                setHasAudio(audioAvailable);



                if(videoRef.current){

                    videoRef.current.srcObject =
                        mediaStream;

                }



            } catch (err) {


                console.error(
                    "Camera initialization failed:",
                    err
                );



                if(err instanceof DOMException){


                    switch(err.name){


                        case "NotAllowedError":

                            setError(
                                "Camera permission denied"
                            );

                            break;



                        case "NotFoundError":

                            setError(
                                "Camera not found"
                            );

                            break;



                        case "NotReadableError":

                            setError(
                                "Camera is already in use"
                            );

                            break;



                        default:

                            setError(
                                err.message
                            );

                    }


                }
                else {

                    setError(
                        "Unknown camera error"
                    );

                }


            }
            finally {


                setLoading(false);


            }


        };



        initializeCamera();



        return () => {


            if(streamRef.current){


                streamRef.current
                    .getTracks()
                    .forEach(track => {

                        track.stop();

                    });


                streamRef.current = null;


            }


        };


    }, []);



    return {

        videoRef,

        stream,

        loading,

        error,

        hasAudio

    };

}
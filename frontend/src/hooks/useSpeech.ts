import { useCallback, useState } from "react";


export default function useSpeech() {

    const [speaking, setSpeaking] =
        useState(false);



    const speak = useCallback(
        (text: string) => {

            if (!window.speechSynthesis) {
                console.error(
                    "Speech synthesis not supported"
                );
                return;
            }


            speechSynthesis.cancel();


            const utterance =
                new SpeechSynthesisUtterance(text);


            utterance.onstart = () => {
                setSpeaking(true);
            };


            utterance.onend = () => {
                setSpeaking(false);
            };


            utterance.onerror = () => {
                setSpeaking(false);
            };


            speechSynthesis.speak(
                utterance
            );

        },
        []
    );



    const stopSpeech = useCallback(() => {

        if (!window.speechSynthesis) {
            return;
        }


        speechSynthesis.cancel();

        setSpeaking(false);

    }, []);



    return {

        speak,

        stopSpeech,

        speaking

    };

}
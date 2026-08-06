import { useState, useCallback } from "react";

import questions from "../data/questions";

import useSpeech from "./useSpeech";
import useTranscript from "./useTranscript";
import useRecorder from "./useRecorder";
import useTimer from "./useTimer";

import type {
    InterviewAnswer,
    InterviewStatus
} from "../types/interview";


export default function useInterview(
    stream: MediaStream | null
) {

    const {
    speak,
    stopSpeech,
    speaking
} = useSpeech();


    const {
        transcript,
        setTranscript,
        listening,
        startListening,
        stopListening
    } = useTranscript();


    const {
        recording,
        videoBlob,
        startRecording,
        stopRecording
    } = useRecorder(stream);


    const timer = useTimer(
        questions[0].expectedTime
    );


    const [currentQuestionIndex, setCurrentQuestionIndex] =
        useState(0);


    const [answers, setAnswers] =
        useState<InterviewAnswer[]>([]);


    const [status, setStatus] =
        useState<InterviewStatus>("idle");



    const currentQuestion =
        questions[currentQuestionIndex];



    /*
        Start interview
    */

    const startInterview = useCallback(() => {

        setStatus("reading");

        speak(
            currentQuestion.question
        );

    }, [
        currentQuestion,
        speak
    ]);



    /*
        Start candidate answer
    */

    const startAnswer = () => {

        setStatus("recording");

        setTranscript("");

        startRecording();

        startListening();

        timer.reset(
            currentQuestion.expectedTime
        );

        timer.start();
    };



    /*
        Stop candidate answer
    */

    const stopAnswer = () => {

        stopRecording();

        stopListening();

        timer.stop();


        const answer: InterviewAnswer = {

            questionId:
                currentQuestion.id,

            transcript,

            video: videoBlob ?? undefined,

            duration:
                currentQuestion.expectedTime -
                timer.seconds
        };


        setAnswers(prev => [
            ...prev,
            answer
        ]);


        setStatus("paused");
    };



    /*
        Go next question
    */

    const nextQuestion = () => {


        stopSpeech();

        stopListening();


        if (
            currentQuestionIndex <
            questions.length - 1
        ) {


            const next =
                currentQuestionIndex + 1;


            setCurrentQuestionIndex(next);


            setTranscript("");


            timer.reset(
                questions[next]
                    .expectedTime
            );


            setStatus("reading");


            speak(
                questions[next]
                    .question
            );


        } else {

            finishInterview();

        }

    };



    /*
        Finish interview
    */

    const finishInterview = () => {

        stopSpeech();

        stopListening();

        timer.stop();

        setStatus("finished");

    };



    return {


        // Question data

        questions,

        currentQuestion,

        currentQuestionIndex,

        totalQuestions:
            questions.length,



        // State

        status,

        answers,



        // Speech

        speaking,



        // Transcript

        transcript,

        setTranscript,

        listening,



        // Recording

        recording,

        videoBlob,



        // Timer

        seconds:
            timer.seconds,



        // Actions

        startInterview,

        startAnswer,

        stopAnswer,

        nextQuestion,

        finishInterview,


        // Low level controls

        startListening,

        stopListening,

        startRecording,

        stopRecording

    };

}
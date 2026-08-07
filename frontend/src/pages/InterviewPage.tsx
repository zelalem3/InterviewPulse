import { useEffect } from "react";

import useCamera from "../hooks/useCamera";
import useInterview from "../hooks/useInterview";
import useSpeech from "../hooks/useSpeech";

import Camera from "../components/interview/camera";
import QuestionCard from "../components/interview/QuestionCard";
import Timer from "../components/interview/Timer";
import Transcript from "../components/interview/Transcript";
import Controls from "../components/interview/Controls";
import ProgressBar from "../components/interview/ProgressBar";


export default function InterviewPage() {


    const {
        videoRef,
        stream,
        loading,
        error
    } = useCamera();



    const {
        speak,
        speaking
    } = useSpeech();




    const {

        currentQuestion,

        currentQuestionIndex,

        totalQuestions,

        status,

        transcript,

        setTranscript,

        listening,

        recording,

        seconds,

        startInterview,

        startAnswer,

        stopAnswer,

        nextQuestion


    } = useInterview(stream);




    /*
        Read interview question using TTS
    */

    useEffect(() => {

        const timer = setTimeout(() => {

            if (currentQuestion?.question) {

                speak(
                    currentQuestion.question
                );

            }

        }, 500);



        return () => clearTimeout(timer);


    }, [currentQuestion]);




    return (

        <div
            className="
            mx-auto
            flex
            max-w-6xl
            flex-col
            gap-6
            p-6
            "
        >


            <h1
                className="
                text-3xl
                font-bold
                "
            >

                AI Interview Platform

            </h1>



            <ProgressBar

                current={
                    currentQuestionIndex + 1
                }

                total={
                    totalQuestions
                }

            />



            <QuestionCard

                question={
                    currentQuestion
                }

                current={
                    currentQuestionIndex + 1
                }

                total={
                    totalQuestions
                }

                speaking={
                    speaking
                }


                onReplay={() => {

                    if(currentQuestion?.question){

                        speak(
                            currentQuestion.question
                        );

                    }

                }}

            />




            <div
                className="
                grid
                gap-6
                md:grid-cols-2
                "
            >


                <Camera

                    videoRef={
                        videoRef
                    }

                    loading={
                        loading
                    }

                    error={
                        error
                    }

                />



                <div
                    className="
                    flex
                    flex-col
                    gap-4
                    "
                >


                    <Timer

                        seconds={
                            seconds
                        }

                    />



                    <Transcript

                        transcript={
                            transcript
                        }

                        onChange={
                            setTranscript
                        }

                    />


                </div>


            </div>





            <Controls

                recording={
                    recording
                }

                listening={
                    listening
                }


                onStart={() => {

                    startAnswer();

                }}


                onStop={() => {

                    stopAnswer();

                }}


                onNext={() => {

                    nextQuestion();

                }}

            />





            <div
                className="
                text-center
                text-gray-500
                "
            >

                Status: {status}

            </div>





            {/* Temporary voice test */}

            <button

                onClick={() =>

                    speak(
                        "Welcome to your AI interview. Please introduce yourself."
                    )

                }

                className="
                rounded
                bg-green-600
                px-4
                py-2
                text-white
                "

            >

                Test Interview Voice

            </button>



        </div>

    );

}
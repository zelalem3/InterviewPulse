import type { InterviewQuestion } from "../../types/interview";


interface Props {

    question: InterviewQuestion;

    current: number;

    total: number;

    speaking: boolean;

    onReplay: () => void;

}



export default function QuestionCard({
    question,
    current,
    total,
    speaking,
    onReplay
}: Props) {


    return (

        <div className="
            rounded-xl
            border
            bg-white
            p-6
            shadow
        ">


            <div className="
                flex
                justify-between
                items-center
            ">

                <h2 className="text-xl font-bold">

                    Question {current} / {total}

                </h2>


                <button
                    onClick={onReplay}
                    className="
                        rounded-lg
                        bg-blue-600
                        px-4
                        py-2
                        text-white
                    "
                >

                    {speaking
                        ? "🔊 Reading..."
                        : "🔁 Replay"}

                </button>


            </div>



            <div className="
                mt-4
                flex
                gap-3
            ">


                <span className="
                    rounded
                    bg-blue-100
                    px-3
                    py-1
                ">

                    {question.category}

                </span>



                <span className="
                    rounded
                    bg-purple-100
                    px-3
                    py-1
                ">

                    {question.difficulty}

                </span>


            </div>



            <p className="
                mt-6
                text-lg
            ">

                {question.question}

            </p>


        </div>

    );
}
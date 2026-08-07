interface Props {

    recording:boolean;

    listening:boolean;

    onStart:()=>void;

    onStop:()=>void;

    onNext:()=>void;

}



export default function Controls({

    recording,

    listening,

    onStart,

    onStop,

    onNext

}:Props){


    return (

        <div className="
            flex
            gap-4
            justify-center
        ">


            {!recording ? (

                <button

                    onClick={onStart}

                    className="
                        rounded-lg
                        bg-green-600
                        px-6
                        py-3
                        text-white
                    "

                >

                    🎤 Start Answer

                </button>


            ):(


                <button

                    onClick={onStop}

                    className="
                        rounded-lg
                        bg-red-600
                        px-6
                        py-3
                        text-white
                    "

                >

                    🛑 Stop Answer

                </button>

            )}



            <button

                onClick={onNext}

                className="
                    rounded-lg
                    bg-blue-600
                    px-6
                    py-3
                    text-white
                "

            >

                ➡ Next

            </button>



            {
                listening &&
                <span className="
                    animate-pulse
                    self-center
                    text-red-600
                ">
                    Recording voice...
                </span>
            }


        </div>

    );

}
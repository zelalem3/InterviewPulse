interface Props {

    transcript:string;

    onChange:(value:string)=>void;

}



export default function Transcript({

    transcript,

    onChange

}:Props){


    return (

        <div className="
            rounded-xl
            border
            bg-white
            p-5
        ">


            <h3 className="
                mb-3
                font-bold
            ">

                Live Transcript

            </h3>



            <textarea

                value={transcript}

                onChange={(e)=>
                    onChange(e.target.value)
                }

                placeholder="
                    Your answer will appear here...
                "

                className="
                    min-h-[150px]
                    w-full
                    rounded-lg
                    border
                    p-3
                    outline-none
                "

            />


        </div>

    );

}
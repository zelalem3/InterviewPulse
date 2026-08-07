interface Props {

    current:number;

    total:number;

}



export default function ProgressBar({

    current,

    total

}:Props){


    const progress =
        (current / total) * 100;


    return (

        <div className="
            h-3
            w-full
            rounded-full
            bg-gray-200
        ">


            <div

                className="
                    h-3
                    rounded-full
                    bg-blue-600
                "

                style={{
                    width:`${progress}%`
                }}

            />


        </div>

    );

}
import { formatTime } from "../../utils/formatTime";


interface Props {
    seconds:number;
}



export default function Timer({
    seconds
}:Props){


    return (

        <div className="
            rounded-lg
            bg-black
            px-5
            py-3
            text-center
            text-2xl
            font-bold
            text-white
        ">

            ⏱ {formatTime(seconds)}

        </div>

    );

}
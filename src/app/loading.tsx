import { CircularProgress } from "@mui/material";

const Loading = () =>{
    return(
        <div className="flex justify-center items-center h-screen">
            <CircularProgress size='100px'/>
        </div>
    )
}

export default Loading;
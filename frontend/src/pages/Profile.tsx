import React, { useEffect, useState } from "react";
import { api } from "../api/axios";


export function Profile(){
    const [profile , setprofile] = useState("")
    useEffect(
        fetchprofile(),[]
    )
    async function fetchprofile()  {
        const resposne = await api.get("/user");
        const data = Response.data
    }


    return <>
    <h1>Profile</h1>
    <p>{profile.name}</p>
    <p>{profile.email}</p>
    <p>{profile.extracted_skills }</p>
    <p>{profile.interviews</p>
    </>
}
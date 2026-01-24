"use client"
import { signOut } from "next-auth/react";

export const HomePage = () => {
    return (<div>
        <div>
        Welcome to servicepal,you are successfully logged in
        </div>
        <button onClick={() => signOut({callbackUrl: "/"})}>
            Logout
        </button>
    </div>);
}
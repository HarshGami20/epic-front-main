"use client"
import { useState } from "react";

interface nameType {
    placeholder: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function PasswordInputBox(props: nameType) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <>
            <input 
                type={`${showPassword ? "text":"password"}`} 
                name="password" 
                className="form-control dz-password" 
                placeholder={props.placeholder} 
                value={props.value}
                onChange={props.onChange}
            />
            <div className={`show-pass ${showPassword ? "active" : ""}`}
                onClick={()=>setShowPassword(!showPassword)}
            >
                <i className="eye-open fa-regular fa-eye" />
            </div>
        </>
    )
}
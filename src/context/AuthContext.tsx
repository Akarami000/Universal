import { createContext, useContext,useState,ReactNode } from "react";

interface AuthContextType {
    userName: string;
    setUserName: (name:string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}:{children:ReactNode})=>{
    const [userName, setUserName] = useState("");
    return(

        <AuthContext.Provider value={{userName, setUserName}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useUser = ()=>{
    const context = useContext(AuthContext);
    if(!context){
        throw new Error("User name must be used within AuthProvider");
    }
    return context;
}
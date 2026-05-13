import { create } from "zustand";
import {axiosInstance} from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) =>({
    authUser:null,
    isCheckingAuth:true,
    isSigningUp: false,
    
    checkAuth:async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            set({authUser: res.data});
        } catch (e) {
            console.log("Error checking authentication:", e);
            set({authUser:null});
        } finally{
            set({isCheckingAuth: false});
        }
    },
    signup: async (data) =>{
        set({isSigningUp:true});
        
        try {
            const res = await axiosInstance.post("/auth/signup",data);
            set({authUser: res.data});
            
            toast.success("Account Created Successfully")
        }  catch (e) {
    toast.error(
        e.response?.data?.message || "Something went wrong"
    );
          } finally{
            set({isSigningUp:false});
             }
    }
}));
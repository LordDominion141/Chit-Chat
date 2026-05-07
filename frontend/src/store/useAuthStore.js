import { create } from "zustand";

export const useAuthStore = create((set) =>({
    authUser:{name:'Dominion', _id:1, age:15},
    isLoggedIn: false,
    isLoading: false,
    login: () =>{
        console.log("We just logged in");
        set({isLoggedIn:true, isLoading: true});
    },
}));
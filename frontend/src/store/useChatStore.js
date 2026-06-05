import { create } from "zustand";
import {axiosInstance} from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) =>({
    allContacts: [],
    chats: [],
    messages: [],
    activeTab: "chats",
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",
    
    toggleSound: ()=>{
        localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
        set({isSoundEnabled: !get().isSoundEnabled})
    },
    
    setActiveTab: (tab) => set({activeTab: tab}),
    setSelectedUser: (selectedUser) => set({selectedUser}),
    
    
    getAllContacts: async (data)=> {
        set({isUsersLoading:true});
        
        try {
            const res = await axiosInstance.get("/messages/contacts",data);
            set({allContacts: res.data.filteredUsers});
            
        }  catch (e) {
    toast.error(
        e.response?.data?.message || "Something went wrong"
    );
          } finally{
            set({isUsersLoading:false});
             }
    },
    
    
    
    getMyChatPartners: async (data) => {
        set({isUsersLoading:true});
        
        try {
            const res = await axiosInstance.get("/messages/chats");
            
            console.log(res.data);
            
            set({ chats: res.data });
            
        }  catch (e) {
    toast.error(
        e.response?.data?.message || "Something went wrong"
    );
          } finally{
            set({isUsersLoading:false});
             }
    },
    
      getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      console.log("Messages response:", res.data);
      set({ messages: res.data.messages });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

    sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set((state) => ({
        messages: [...state.messages.filter(m => m._id !== tempId), res.data]
      }));
    } catch (error) {
      // 🔥 OPTIMIZATION: Only remove the specific temporary message that failed
      set((state) => ({
        messages: state.messages.filter((m) => m._id !== tempId),
      }));
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },
  

  subscribeToMessages: () => {
  const socket = useAuthStore.getState().socket;

  socket.off("newMessage");

  socket.on("newMessage", (newMessage) => {
    const selectedUser = get().selectedUser;
    const { authUser } = useAuthStore.getState();

    if (!selectedUser || !authUser) return;

    // Verify the message belongs to this conversation window
    const isRelevant =
      (newMessage.senderId.toString() === selectedUser._id.toString() && newMessage.receiverId.toString() === authUser._id.toString()) ||
      (newMessage.senderId.toString() === authUser._id.toString() && newMessage.receiverId.toString() === selectedUser._id.toString());

    if (!isRelevant) return;

    set((state) => {
      // 1. Strict ID Check (handles standard messages)
      const exactIdExists = state.messages.some(msg => msg._id === newMessage._id);
      if (exactIdExists) return state;

      // 2. 🔥 FIX: Optimistic Match Check
      // If the incoming message is from YOU, check if an optimistic temporary message 
      // with the exact same text already exists in your state.
      if (newMessage.senderId.toString() === authUser._id.toString()) {
        const isOptimisticDuplicate = state.messages.some(
          (msg) => msg.isOptimistic && msg.text === newMessage.text
        );
        
        // If it matches an optimistic message, let the HTTP request handle replacing it.
        // Ignore the socket emission on the sending device.
        if (isOptimisticDuplicate) return state;
      }

      return {
        messages: [...state.messages, newMessage],
      };
    });
  });
},



  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },
}));


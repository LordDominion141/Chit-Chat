import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (!selectedUser) return;

    getMessagesByUserId(selectedUser._id);  
    subscribeToMessages();  

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <ChatHeader />

      {/* MESSAGES AREA */}  
      <div className="flex-1 w-full max-w-full min-w-0 px-3 md:px-6 overflow-y-auto py-4 md:py-8">  
          
        {messages.length > 0 && !isMessagesLoading ? (  
            
          <div className="w-full max-w-full space-y-6">  

            {messages.map((msg) => (  
              <div  
                key={msg._id || msg.createdAt}  
                className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"} w-full`}  
              >  
                <div  

                  className={`chat-bubble relative max-w-[75%] break-words whitespace-pre-wrap rounded-2xl px-4 py-2.5 shadow-md ${  
                    msg.senderId === authUser._id  
                      ? "bg-[#4f46e5] text-white"  
                      : "bg-[#131b2e] text-[#dae2fd] border border-[#464555]/20"  
                  }`}  
                >  
                  {msg.image && (  
                    <img  
                      src={msg.image}  
                      alt="Shared"  
                      className="rounded-xl h-48 max-w-full object-cover mb-1"  
                    />  
                  )}  

                  {msg.text && <p className="break-words leading-relaxed text-[15px]">{msg.text}</p>}  

                  <p className={`text-[10px] mt-1 text-right block ${
                    msg.senderId === authUser._id ? "text-indigo-200/80" : "text-[#c7c4d8]/50"
                  }`}>  
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, {  
                      hour: "2-digit",  
                      minute: "2-digit",  
                    })}  
                  </p>  
                </div>  
              </div>  
            ))}  

            <div ref={messageEndRef} />  
          </div>  

        ) : isMessagesLoading ? (  
          <MessagesLoadingSkeleton />  
        ) : (  
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />  
        )}  
      </div>  

      <MessageInput />  
    </>
  );
}

export default ChatContainer;

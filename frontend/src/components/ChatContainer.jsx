import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

function ChatContainer() {
  const { selectedUser, getMessagesByUserId, messages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
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

      <div className="flex-1 px-3 md:px-6 overflow-y-auto py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg._id} className={`chat ${msg.senderId === authUser._id ? "chat-end" : "chat-start"}`}>
                <div
                  className={`relative min-h-fit shadow-md px-4 py-2.5 rounded-2xl max-w-[85%] md:max-w-[75%]
                  ${msg.senderId === authUser._id 
                    ? "bg-[#4f46e5] text-white rounded-tr-none" 
                    : "bg-[#1e293b] text-[#dae2fd] rounded-tl-none border border-[#464555]/40"
                  }`}
                >
                  {msg.image && <img src={msg.image} alt="Shared" className="rounded-lg h-48 object-cover mb-1" />}
                  {msg.text && <p className="leading-relaxed text-[15px]">{msg.text}</p>}
                  <p className={`text-[10px] mt-1 opacity-70 ${msg.senderId === authUser._id ? "text-indigo-100" : "text-[#c7c4d8]"}`}>
                    {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
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

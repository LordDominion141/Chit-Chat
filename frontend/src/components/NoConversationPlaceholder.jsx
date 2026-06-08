import { MessageCircleIcon } from "lucide-react";

const NoConversationPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-transparent">
      
      <div className="size-20 bg-[#4f46e5]/15 border border-[#4f46e5]/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <MessageCircleIcon className="size-10 text-[#c3c0ff]" />
      </div>
      

      <h3 className="text-xl font-bold text-[#dae2fd] mb-2">Select a conversation</h3>
      
      

      <p className="text-[#c7c4d8]/70 max-w-md text-sm leading-relaxed">
        Choose a contact from the sidebar to start chatting or continue a previous conversation.
      </p>
      
    </div>
  );
};

export default NoConversationPlaceholder;

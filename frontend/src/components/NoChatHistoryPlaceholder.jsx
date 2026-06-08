import { MessageCircleIcon } from "lucide-react";

const NoChatHistoryPlaceholder = ({ name }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-transparent">
      

      <div className="w-16 h-16 bg-[#4f46e5]/15 border border-[#4f46e5]/20 rounded-full flex items-center justify-center mb-5 shadow-sm">
        <MessageCircleIcon className="size-8 text-[#c3c0ff]" />
      </div>
      

      <h3 className="text-xl font-bold text-[#dae2fd] mb-3">
        Start your conversation with {name}
      </h3>
      
      <div className="flex flex-col space-y-3 max-w-md mb-6">

        <p className="text-[#c7c4d8]/70 text-sm leading-relaxed">
          This is the beginning of your conversation. Send a message to start chatting!
        </p>
        

        <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#4f46e5]/40 to-transparent mx-auto mt-2"></div>
      </div>
      

      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        <button className="px-4 py-2 text-xs font-semibold text-[#ddb8ff] bg-[#4f46e5]/18 border border-[#4f46e5]/25 rounded-full hover:bg-[#4f46e5]/28 active:scale-[0.96] cursor-pointer transition-all">
          👋 Say Hello
        </button>
        <button className="px-4 py-2 text-xs font-semibold text-[#ddb8ff] bg-[#4f46e5]/18 border border-[#4f46e5]/25 rounded-full hover:bg-[#4f46e5]/28 active:scale-[0.96] cursor-pointer transition-all">
          🤝 How are you?
        </button>
        <button className="px-4 py-2 text-xs font-semibold text-[#ddb8ff] bg-[#4f46e5]/18 border border-[#4f46e5]/25 rounded-full hover:bg-[#4f46e5]/28 active:scale-[0.96] cursor-pointer transition-all">
          📅 Meet up soon?
        </button>
      </div>
      
    </div>
  );
};

export default NoChatHistoryPlaceholder;

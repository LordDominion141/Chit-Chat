import { MessageCircleIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-5 bg-transparent">
      

      <div className="w-16 h-16 bg-[#4f46e5]/15 border border-[#4f46e5]/20 rounded-full flex items-center justify-center shadow-sm">
        <MessageCircleIcon className="w-8 h-8 text-[#c3c0ff]" />
      </div>
      

      <div>

        <h4 className="text-[#dae2fd] font-bold text-lg mb-1.5">No conversations yet</h4>

        <p className="text-[#c7c4d8]/70 text-sm px-8 leading-relaxed max-w-sm">
          Start a new chat by selecting a contact from the contacts tab.
        </p>
      </div>


      <button
        onClick={() => setActiveTab("contacts")}
        className="px-5 py-2.5 text-xs font-semibold text-[#ddb8ff] bg-[#4f46e5]/18 border border-[#4f46e5]/25 rounded-xl hover:bg-[#4f46e5]/28 active:scale-[0.96] transition-all cursor-pointer"
      >
        Find contacts
      </button>

    </div>
  );
}

export default NoChatsFound;

import { useChatStore } from "../store/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (

    <div className="tabs tabs-boxed bg-[#131b2e]/30 border border-[#464555]/15 p-1.5 mx-4 my-2 rounded-xl flex gap-1">
      <button
        onClick={() => setActiveTab("chats")}

        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center ${
          activeTab === "chats"
            ? "bg-[#4f46e5]/18 text-[#ddb8ff] border border-[#4f46e5]/25 shadow-sm"
            : "text-[#c7c4d8]/60 hover:text-[#dae2fd] hover:bg-[#c3c0ff]/5"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}

        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center ${
          activeTab === "contacts"
            ? "bg-[#4f46e5]/18 text-[#ddb8ff] border border-[#4f46e5]/25 shadow-sm"
            : "text-[#c7c4d8]/60 hover:text-[#dae2fd] hover:bg-[#c3c0ff]/5"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}

export default ActiveTabSwitch;

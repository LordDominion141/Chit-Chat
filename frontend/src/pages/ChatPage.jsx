import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="w-full flex justify-center p-0 md:p-4 bg-transparent">
      <div className="relative w-[98vw] md:w-full md:max-w-6xl md:h-[850px] h-[96dvh] mx-auto">
        <BorderAnimatedContainer>  
          <div className="w-full h-full flex flex-col overflow-hidden">  
            <div className="w-full pt-8 pb-2 text-center border-b border-[#464555]/15 shrink-0 bg-[#0b1326]/50">
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#dae2fd] via-[#c3c0ff] to-[#ddb8ff] bg-clip-text text-transparent">
                💬 Chit-Chat
              </h1>
            </div>
            <div className="w-full flex flex-1 flex-row overflow-hidden">      
              <div className={`${selectedUser ? "hidden md:flex" : "flex"} w-full md:w-80 flex-shrink-0 flex-col bg-[#131b2e]/60 backdrop-blur-sm md:border-r border-[#464555]/20 overflow-hidden`}>      
                <ProfileHeader />      
                <ActiveTabSwitch />  
                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-[#464555]/40 scrollbar-track-transparent">      
                  {activeTab === "chats" ? <ChatsList /> : <ContactList />}      
                </div>      
              </div>      
              <div className={`${selectedUser ? "flex" : "hidden md:flex"} flex-1 w-full min-w-0 flex-col bg-[#0b1326]/40 backdrop-blur-sm overflow-hidden`}>      
                {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}      
              </div>      
            </div> 
          </div>  
        </BorderAnimatedContainer>  
      </div>  
    </div>
  );      
}

export default ChatPage; 

import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";
import { useAuthStore } from "../store/useAuthStore";

function ChatsList() {
  const { getMyChatPartners, chats, isUsersLoading, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getMyChatPartners();
  }, [getMyChatPartners]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}

          className="bg-[#4f46e5]/18 p-4 rounded-xl cursor-pointer hover:bg-[#4f46e5]/28 transition-all duration-200 border border-[#4f46e5]/25 shadow-sm"
          onClick={() => setSelectedUser(chat)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full border border-[#464555]/30 overflow-hidden">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} className="object-cover w-full h-full" />
              </div>
            </div>
            <h4 className="text-[#dae2fd] font-medium truncate flex-1">{chat.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}

export default ChatsList;

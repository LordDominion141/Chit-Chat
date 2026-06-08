import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id} 

          className="bg-[#4f46e5]/18 p-4 rounded-xl cursor-pointer hover:bg-[#4f46e5]/28 transition-all duration-200 border border-[#4f46e5]/25 shadow-sm"
          onClick={() => setSelectedUser(contact)}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full border border-[#464555]/30 overflow-hidden">
                <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} className="object-cover w-full h-full" />
              </div>
            </div>

            <h4 className="text-[#dae2fd] font-medium truncate flex-1">{contact.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}

export default ContactList;

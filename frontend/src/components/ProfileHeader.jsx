import { useState, useRef } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const mouseClickSound = new Audio("/sounds/mouse-click.mp3");

function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();  
    reader.readAsDataURL(file);  

    reader.onloadend = async () => {  
      const base64Image = reader.result;  
      setSelectedImg(base64Image);  
      await updateProfile({ profilePic: base64Image });  
    };
  };

  return (

    <div className="p-6 border-b border-[#464555]/30 bg-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          

          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group border border-[#464555]/40 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User image"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                <span className="text-white text-[11px] font-medium">Change</span>
              </div>
            </button>

            <input  
              type="file"  
              accept="image/*"  
              ref={fileInputRef}  
              onChange={handleImageUpload}  
              className="hidden"  
            />  
          </div>  


          <div>  

            <h3 className="text-[#dae2fd] font-semibold text-base max-w-[150px] md:max-w-[180px] truncate">  
              {authUser.fullName}  
            </h3>  

            <p className="text-[#c7c4d8]/60 text-xs mt-0.5">Online</p>  
          </div>  
        </div>  


        <div className="flex gap-4 items-center">  
          

          <button  
            className="text-[#c7c4d8]/60 hover:text-[#c3c0ff] transition-colors cursor-pointer p-1 rounded-md hover:bg-[#4f46e5]/10"  
            onClick={logout}  
            title="Logout"
          >  
            <LogOutIcon className="size-5" />  
          </button>  


          <button  
            className="text-[#c7c4d8]/60 hover:text-[#c3c0ff] transition-colors cursor-pointer p-1 rounded-md hover:bg-[#4f46e5]/10"  
            onClick={() => {  
              // play click sound before toggling  
              mouseClickSound.currentTime = 0; // reset to start  
              mouseClickSound.play().catch((error) => console.log("Audio play failed:", error));  
              toggleSound();  
            }}  
            title={isSoundEnabled ? "Mute sounds" : "Unmute sounds"}
          >  
            {isSoundEnabled ? (  
              <Volume2Icon className="size-5 text-[#ddb8ff]" />  
            ) : (  
              <VolumeOffIcon className="size-5" />  
            )}  
          </button>  
          
        </div>  
      </div>  
    </div>
  );
}

export default ProfileHeader;

import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const fileInputRef = useRef(null);

  const { sendMessage, isSoundEnabled } = useChatStore();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({  
      text: text.trim(),  
      image: imagePreview,  
    });  
    setText("");  
    setImagePreview(null);  
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();  
    reader.onloadend = () => setImagePreview(reader.result);  
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (

    <div className="p-3 md:p-4 border-t border-[#464555]/30 w-full min-w-0 bg-transparent">  
      {imagePreview && (  
        <div className="w-full max-w-full mb-3 flex items-center">  
          <div className="relative">  
            <img  
              src={imagePreview}  
              alt="Preview"  

              className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border border-[#464555]/40"  
            />  
            <button  
              onClick={removeImage}  

              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#131b2e] flex items-center justify-center text-[#dae2fd] border border-[#464555]/50 hover:bg-[#1c263f] transition-colors"  
              type="button"  
            >  
              <XIcon className="w-4 h-4" />  
            </button>  
          </div>  
        </div>  
      )}  

      <form  
        onSubmit={handleSendMessage}  
        className="w-full max-w-full flex items-center gap-2 md:gap-4 min-w-0"  
      >  
        <input  
          type="text"  
          value={text}  
          onChange={(e) => {  
            setText(e.target.value);  
            isSoundEnabled && playRandomKeyStrokeSound();  
          }}  

          className="flex-1 min-w-0 bg-[#131b2e] border border-[#464555] rounded-xl py-2.5 px-3 md:px-4 text-[#dae2fd] placeholder-[#c7c4d8]/40 focus:outline-none focus:ring-2 focus:ring-[#c3c0ff] focus:border-transparent transition-all"  
          placeholder="Type your message..."  
        />  

        <input  
          type="file"  
          accept="image/*"  
          ref={fileInputRef}  
          onChange={handleImageChange}  
          className="hidden"  
        />  

        <button  
          type="button"  
          onClick={() => fileInputRef.current?.click()}  

          className={`shrink-0 h-11 bg-[#131b2e] border border-[#464555] text-[#c7c4d8]/60 hover:text-[#dae2fd] rounded-xl px-3 md:px-4 flex items-center justify-center transition-colors ${  
            imagePreview ? "text-[#c3c0ff] border-[#4f46e5]/50 bg-[#4f46e5]/10" : ""  
          }`}  
        >  
          <ImageIcon className="w-5 h-5" />  
        </button>  

        <button  
          type="submit"  
          disabled={!text.trim() && !imagePreview}  

          className="shrink-0 h-11 bg-[#4f46e5] text-white rounded-xl px-4 md:px-5 flex items-center justify-center font-semibold shadow-md active:scale-[0.97] hover:bg-[#3323cc] transition-all disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed"  
        >  
          <SendIcon className="w-5 h-5" />  
        </button>  
      </form>
    </div>  
  );  
}  

export default MessageInput;

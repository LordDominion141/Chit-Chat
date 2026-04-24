import Message from "../models/Message.js"
import User from "../models/User.js"
import cloudinary from "../lib/cloudinary.js"

//get all contacts
const getAllContacts = async (req, res) =>{
    try {
        
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({_id: { $ne: loggedInUserId } }).select('-password');
    
    res.status(200).json({filteredUsers})
    
    } catch (e) {
        
        console.log("Error in getAllContacts:", e)
        res.status(500).json({message:"Internal Server Error:"})
    
    }
}


//get messages by id
const getMessagesByUserId = async (req, res)=>{
    try {
        
        const myId = req.user._id;
        const {id:userToChatId} = req.params;
        
        const messages = await Message.find({
            $or: [
        {senderId: myId, receiverId: userToChatId},
        {senderId: userToChatId, receiverId: myId}
                ]
        });
    
    res.status(200).json({messages})
    } catch (e) {
        
        console.log('Error in getMessagesByUserId:', e)
        res.status(500).json({message:"Internal Server Error "})
    }
}


//send message
const sendMessage = async (req, res)=>{
    
    try {
        const {text,image} = req.body;
        const {id:receiverId} = req.params;
        const senderId = req.user._id;
        
        const normalizedText = typeof text === "string" ? text.trim() : "";

        if (!normalizedText && !image) {
            return res.status(400).json({ message: "Message must include text or image" });
        }

        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found" });
        }


        
        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
            if (!imageUrl) throw new Error("Cloudinary upload did not return secure_url");
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            text: normalizedText || undefined,
            image: imageUrl
        });
        
        await newMessage.save();
        res.status(201).json(newMessage)
        
    } catch (e) {
        console.log("Error in send message:", e);
        res.status(500).json({message:"Internal Server Error."})
    }
        
}

//get chats
const getChatPartners = async (req, res) =>{
    
    try{
    const loggedInUserId = req.user._id;
    
    //find all the messages where the loggedInUser is either sender or receiver.
    const messages = await Message.find({
            $or: [
        {senderId: loggedInUserId},
        {receiverId: loggedInUserId}
                ]
        });
        
    const chatPartnerIds = [...new Set(messages.map(msg => msg.senderId.toString() === loggedInUserId.toString()? msg.receiverId.toString(): msg.senderId.toString())
    ),];
    
    const chatPartners = await User.find({_id:{$in: chatPartnerIds}}). select("-password");
    res.status(200).json(chatPartners);
    
} catch(e){
    console.log("Error in  getChatPartners:", e);
        res.status(500).json({message:"Internal Server Error."})
}

}

const messageController = {
    getAllContacts,
    getMessagesByUserId,
    sendMessage,
    getChatPartners
}

export default messageController;
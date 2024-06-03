import { db } from "../utils/firebaseAdmin"

class ChatRoom{
    constructor(senderId, receiverId){
        this.senderId = senderId
        this.receiverId = receiverId
        this.messages = []
        this.chatRoomRef = db.collection('chatRoom')
    }
}

export {ChatRoom} 
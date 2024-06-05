import { db } from "../utils/firebaseAdmin"

class Notification{
    constructor(userId , messageId){
        this.userId = userId
        this.messageId = messageId
        this.notificationRef = db.collection('notification')
    }
}

export {Notifications}
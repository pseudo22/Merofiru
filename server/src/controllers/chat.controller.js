import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { db } from "../utils/firebaseAdmin.js";

const getMessages = asyncHandler(async (req, res) => {
    const { senderId, receiverId } = req.params;

    try {
        const chatId = `${senderId}_${receiverId}`;
        const reverseChatId = `${receiverId}_${senderId}`;
        const chatDocId = chatId > reverseChatId ? reverseChatId : chatId;

        const chatDocRef = db.collection('chats').doc(chatDocId);

        const [chatDoc, messagesSnapshot] = await Promise.all([
            chatDocRef.get(),
            chatDocRef
                .collection('messages')
                .orderBy('timestamp' , 'desc')
                .limit(10)
                .get(),
        ]);

        if (!chatDoc.exists) {
            return res.status(404).json(new ApiResponse(404, '', 'Chat document not found'));
        }

        const lastMessage = chatDoc.data().lastMessage || null;
        const lastMessageDetails = {
            id : lastMessage?.id,
            seenByBoth : lastMessage?.seenByUsers.length == 2
        }

        const lastMessageSeenByBothUsers = chatDoc.data().lastMessageSeenByBothUsers || null;
        const lastMessageSeenByBothUsersDetails = {
            id : lastMessageSeenByBothUsers?.id,
            seenByBoth : lastMessageSeenByBothUsers?.seenByUsers.length == 2
        }

        
        const messages = messagesSnapshot.docs.map((doc) => doc.data());

        if (messages.length === 0) {
            return res.status(404).json(new ApiResponse(404, '', 'No messages found'));
        }

        res.status(200).json(
            new ApiResponse(200, { lastMessageDetails, lastMessageSeenByBothUsersDetails, chats: messages.reverse() }, 'messages fetched')
        );
    } catch (error) {
        res.status(500).json(new ApiResponse(404, '', 'error while fetching messages'));
    }
});

const fetchLastNotSeenMessage = asyncHandler(async (req, res) => {

    const {userId} = req.body

    try {

        const chatDocsSnap = await db.collection('chats')
                            .where('lastMessage.seenByUsers' , 'not-in' , [userId])
                            .get()

        if (chatDocsSnap.empty){
            return res.status(404).json(new ApiResponse(404 , '' , 'no unseen messages'))
        }

        const unseenMessage = chatDocsSnap.docs.map(doc => {
            const chatData = doc.data()
            const lastMessage = chatData.lastMessage
            const otherUserId = lastMessage.senderId === userId ? chatData.receiverId : lastMessage.senderId

            return {
                lastMessage : lastMessage.message,
                otherUserId : otherUserId
            }
        })

        return res.status(200).json(new ApiResponse(200 , unseenMessage , 'unseen messages fetched'))
        
    } catch (error) {
       return  res.status(500).json(new ApiResponse(500 , '' , 'error fetching unseen messages'))
    }

})


export { getMessages , fetchLastNotSeenMessage };

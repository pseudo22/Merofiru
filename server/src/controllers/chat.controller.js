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

        res.status(200).json(
            new ApiResponse(200, { lastMessageDetails, lastMessageSeenByBothUsersDetails, chats: messages.reverse() }, 'messages fetched')
        );
    } catch (error) {
        res.status(404).json(new ApiResponse(404, '', 'no messages found'));
    }
});

export { getMessages };

import { Message } from "../models/message.model.js";
import { Chat } from "../models/chat.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const sendMessage = AsyncHandler(async (req, res) => {
  const { chatId, content, receiverId } = req.body;

  let activeChatId = chatId;

  if (!activeChatId && receiverId) {
    // Check if a direct chat already exists
    let chat = await Chat.findOne({
      chatType: "direct",
      participants: { $all: [req.user._id, receiverId] }
    });

    if (!chat) {
      chat = await Chat.create({
        chatId: `direct_${Math.min(req.user._id, receiverId)}_${Math.max(req.user._id, receiverId)}`,
        chatType: "direct",
        participants: [req.user._id, receiverId],
        createdBy: req.user._id
      });
    }
    activeChatId = chat._id;
  }

  if (!activeChatId) throw new ApiError(400, "Chat ID or Receiver ID is required");

  const message = await Message.create({
    chatId: activeChatId,
    senderId: req.user._id,
    content,
    messageType: "text"
  });

  await Chat.findByIdAndUpdate(activeChatId, {
    lastMessage: content,
    lastSender: req.user._id,
    lastMessageTime: new Date(),
    $inc: { messageCount: 1 }
  });

  return res.status(201).json(new ApiResponse(201, { message }, "Message sent"));
});

const getChatMessages = AsyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const messages = await Message.find({ chatId })
    .sort({ createdAt: 1 })
    .populate("senderId", "username profilePicture");
  return res.status(200).json(new ApiResponse(200, { messages }, "Messages fetched"));
});

const getMyChats = AsyncHandler(async (req, res) => {
  const chats = await Chat.find({ participants: req.user._id })
    .sort({ lastMessageTime: -1 })
    .populate("participants", "username profilePicture");
  return res.status(200).json(new ApiResponse(200, { chats }, "Chats fetched"));
});

export { sendMessage, getChatMessages, getMyChats };

import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { sendMessage, getChatMessages, getMyChats } from "../controllers/message.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/send").post(sendMessage);
router.route("/my-chats").get(getMyChats);
router.route("/:chatId").get(getChatMessages);

export default router;

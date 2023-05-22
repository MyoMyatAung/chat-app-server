const Chat = require("../models/chat.model");
const Message = require("../models/message.model");
const User = require("../models/user.model");
const {
  create200Response,
  create400Response,
  create201Response,
} = require("../utils/responseFunc");

/**
 * @GET /api/message/:id
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.handleFetchMessage = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.id })
      .populate("sender", "name profilePic email")
      .populate("chat");
    return create200Response(res, messages);
  } catch (error) {
    return create400Response(res, error);
  }
};

/**
 * @POST /api/message/send-message
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.handleSendMessage = async (req, res) => {
  const { chatId, content } = req.body;
  const sender = req.user._id;
  try {
    const messageBP = {
      sender: sender,
      content: content,
      chat: chatId,
    };
    let message = await Message.create(messageBP);
    message = await message.populate("sender", "name profilePic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name profilePic email",
    });
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    return create201Response(res, message);
  } catch (error) {
    return create400Response(res, error.message);
  }
};

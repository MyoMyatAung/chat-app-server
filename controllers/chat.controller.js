const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const {
  create400Response,
  create200Response,
  create201Response,
} = require("../utils/responseFunc");

/**
 * @POST /api/chat
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return create400Response(res, "UserID is required!");
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name profilePic email",
  });

  if (isChat.length > 0) {
    return create200Response(res, isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return create201Response(res, fullChat);
    } catch (error) {
      return create400Response(res, error.message);
    }
  }
};

/**
 * @GET /api/chat
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.fetchChat = async (req, res) => {
  try {
    let chat = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
    chat = await User.populate(chat, {
      path: "latestMessage.sender",
      select: "name profilePic email",
    });
    return create200Response(res, chat);
  } catch (error) {
    return create400Response(res, error.message);
  }
};

/**
 * @POST /api/user/group
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.createGroup = async (req, res) => {
  const { name, users } = req.body;
  if (!name || !users || users.length <= 0) {
    return create400Response(res, "Both name and users are required!");
  }

  if (users.length < 2) {
    return create400Response(res, "Need more than 2 users!");
  }

  users.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return create201Response(res, fullGroupChat);
  } catch (error) {
    return create400Response(res, error.message);
  }
};

/**
 * @PUT /api/chat/group/rename
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.renameGroup = async (req, res) => {
  const { id, chatName } = req.body;
  try {
    const chat = await Chat.findByIdAndUpdate(id, { chatName }, { new: true })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    return create200Response(res, chat);
  } catch (error) {
    return create400Response(res, error.message);
  }
};

/**
 * @PUT /api/chat/group/add-member
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<Chat>}
 */
exports.addMember = async (req, res) => {
  const { id, users } = req.body;
  try {
    const chat = await Chat.findByIdAndUpdate(
      id,
      { $push: { users: users } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    return create200Response(res, chat);
  } catch (error) {
    return create400Response(res, error.message);
  }
};

/**
 * @PUT /api/chat/group/remove-member
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {Promise<Chat>}
 */
exports.removeMember = async (req, res) => {
  const { id, users } = req.body;
  try {
    const chat = await Chat.findByIdAndUpdate(
      id,
      { $pull: { users: { $in: users } } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    return create200Response(res, chat);
  } catch (error) {
    return create400Response(res, error.message);
  }
};

/**
 * @PUT /api/chat/group/:id
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.updateGroupChat = async (req, res) => {
  const chat_id = req.params.id;
  const { name, users } = req.body;
  try {
    const chat = await Chat.findByIdAndUpdate(
      chat_id,
      { chatName: name, users: [...users, req.user._id] },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    return create200Response(res, chat);
  } catch (error) {
    return create400Response(res, error);
  }
};

const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  accessChat,
  fetchChat,
  createGroup,
  renameGroup,
  addMember,
  removeMember,
  updateGroupChat,
} = require("../controllers/chat.controller");

router.post("/", protect, accessChat);
router.get("/", protect, fetchChat);
router.post("/group", protect, createGroup);
router.put("/group/rename", protect, renameGroup);
router.put("/group/add-member", protect, addMember);
router.put("/group/remove-member", protect, removeMember);
router.put("/group/:id", protect, updateGroupChat);

module.exports = router;

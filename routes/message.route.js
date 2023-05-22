const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  handleFetchMessage,
  handleSendMessage,
} = require("../controllers/message.controller");
const router = express.Router();

router.get("/:id", protect, handleFetchMessage);

router.post("/send-message", protect, handleSendMessage);

module.exports = router;

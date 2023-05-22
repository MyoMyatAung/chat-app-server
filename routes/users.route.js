const path = require("path");
const express = require("express");
const multer = require("multer");
const { signup, login, getAllUser } = require("../controllers/user.controller");
const { protect } = require("../middlewares/authMiddleware");

const storageEngine = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  },
});

/**
 *
 * @param {Express.Multer.File} file
 * @param {multer.FileFilterCallback} cb
 * @returns {multer.FileFilterCallback}
 */
const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/; //check extension names

  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};

const router = express.Router();

router.post("/signup", upload.single("profilePic"), signup);
router.post("/login", login);
router.get("/", protect, getAllUser);

module.exports = router;

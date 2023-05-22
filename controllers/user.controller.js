const User = require("../models/user.model");
const { generateToken } = require("../utils/generateToken");
const {
  create400Response,
  create201Response,
  create500Response,
  create403Response,
  create401Response,
  create200Response,
} = require("../utils/responseFunc");

/**
 * @POST /api/user/signup
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {User, jwt-token}
 */
exports.signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password) {
    return create400Response(res, "Enter All field");
  }
  const user = await User.findOne({ email });
  if (!!user) {
    return create400Response(res, "User already exists");
  }

  const profilePic = `http://localhost:5000/api/profilepic/${req.file.filename}`;

  const savedUser = await User.create({
    name,
    email,
    password,
    profilePic,
  });

  if (!!savedUser) {
    return create201Response(res, {
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
      token: generateToken({
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        profilePic: savedUser.profilePic,
      }),
    });
  } else {
    return create500Response(res, "Fail to create user");
  }
};

/**
 * @POST /api/user/login
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns {User, jwt-token}
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!!user && (await user.matchPassword(password))) {
    return create200Response(res, {
      _id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      token: generateToken({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
      }),
    });
  } else {
    return create401Response(res, "Invalid email or password");
  }
};

/**
 * @GET /api/user?search=some-query
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
exports.getAllUser = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  return create200Response(res, users);
};

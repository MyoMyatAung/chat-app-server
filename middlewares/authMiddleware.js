const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");
const { create401Response } = require("../utils/responseFunc.js");

/**
 * Route protector
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @returns req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      //decodes token _id
      const decoded = jwt.verify(token, process.env.MY_SECRET_KEY);

      req.user = await User.findById(decoded._id).select("-password");

      next();
    } catch (error) {
      return create401Response(res, "Not authorized, token failed");
    }
  }

  if (!token) {
    return create401Response(res, "Not authorized, no token");
  }
};

module.exports = { protect };

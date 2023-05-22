const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  const token = jwt.sign({...user}, process.env.MY_SECRET_KEY, {
    expiresIn: "30d",
  });
  return token;
};

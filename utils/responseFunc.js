/**
 * Template functions for all specific response
 */

exports.create400Response = (res, msg) => {
  return res.status(400).json({ msg });
};

exports.create200Response = (res, data) => {
  return res.status(200).json({ data });
};

exports.create201Response = (res, data) => {
  return res.status(201).json({ data });
};

exports.create401Response = (res, msg) => {
  return res.status(401).json({ msg });
};

exports.create403Response = (res, msg) => {
  return res.status(403).json({ msg });
};

exports.create500Response = (res, error) => {
  return res.status(500).json({ error: error.message });
};

exports.create404Response = (res, msg) => {
  return res.status(404).json({ msg });
};

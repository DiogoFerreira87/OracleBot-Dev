const mongoose = require("mongoose");

const UsersProfileSchema = new mongoose.Schema({
  discordID: { type: mongoose.SchemaTypes.String, required: true, unique: true},
  discordUser: { type: mongoose.SchemaTypes.String, required: true},
  nickname: { type: mongoose.SchemaTypes.String},
  oracle: { type: mongoose.SchemaTypes.Boolean},
  status: { type: mongoose.SchemaTypes.String},
  active: { type: mongoose.SchemaTypes.Boolean},
  joinDate: { type: mongoose.SchemaTypes.Date}
}, {versionKey: false}, {strict: false});

module.exports = mongoose.model('userprofile', UsersProfileSchema, 'userprofile');



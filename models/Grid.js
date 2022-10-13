const mongoose = require("mongoose");

const GridSchema = new mongoose.Schema({
  gridID: { type: mongoose.SchemaTypes.Number, required: true},
  type: { type: mongoose.SchemaTypes.String, required: true},
  date: { type: mongoose.SchemaTypes.Date, required: true},
  description: { type: mongoose.SchemaTypes.String, required: true},
  userListID: { type: mongoose.SchemaTypes.Number, required: true},
  user: { type: mongoose.SchemaTypes.String, required: true},
  userID: { type: mongoose.SchemaTypes.String, required: true},
  starter: { type: mongoose.SchemaTypes.Boolean, required: true},
  queue: { type: mongoose.SchemaTypes.Boolean, required: true},
  backup: { type: mongoose.SchemaTypes.Boolean, required: true},
  quitter: { type: mongoose.SchemaTypes.Boolean, required: true},
  createdDate: { type: mongoose.SchemaTypes.Date, required: true},
  updatedDate: { type: mongoose.SchemaTypes.Date},

}, {versionKey: false}, {strict: false});

module.exports = mongoose.model('grid', GridSchema, 'grid');



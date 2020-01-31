
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' }
});


module.exports = mongoose.model('Author', AuthorSchema);
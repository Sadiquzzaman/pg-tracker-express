const mongoose = require("mongoose");
const uuid = require("uuid");
const { toJSON, paginate } = require("../plugins");
const { lang } = require("../../config/lang");

const enumList = lang.members.status.map((status) => status.value);
const defaultStatus = lang.members.status.find(
  (status) => status.default === true
).value;

const memberSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
  },
  workspace_ids: [],
  task_ids: [],
  role_id: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: enumList,
    default: defaultStatus,
  },
});

// add plugin that converts mongoose to json
memberSchema.plugin(toJSON);
memberSchema.plugin(paginate);

const Member = mongoose.model("Member", memberSchema);
module.exports = Member;

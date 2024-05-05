const mongoose = require("mongoose");
const { toJSON, paginate } = require("../plugins");
const { lang } = require("../../config/lang");

const enumList = lang.workspaces.status.map((status) => status.value);
const defaultStatus = lang.workspaces.status.find(
  (status) => status.default === true
).value;

const workspaceSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  members: [],
  teams: [],
  trackers: [],
  created_by: {
    type: String,
    required: true,
  },
  status_bar: {
    type: mongoose.Schema.Types.Mixed,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: enumList,
    default: defaultStatus,
  },
});

// add plugin that converts mongoose to json
workspaceSchema.plugin(toJSON);
workspaceSchema.plugin(paginate);

workspaceSchema.statics.isNameTaken = async function (workspaceName) {
  const workspace = await this.findOne({ workspaceName });
  return !!workspace;
};

const Workspace = mongoose.model("Workspace", workspaceSchema);
module.exports = Workspace;

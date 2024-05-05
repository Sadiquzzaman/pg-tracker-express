const mongoose = require("mongoose");
const uuid = require("uuid");
const { toJSON, paginate } = require("../plugins");
const { lang } = require("../../config/lang");

const enumList = lang.invitations.status.map((status) => status.value);
const defaultStatus = lang.invitations.status.find(
  (status) => status.default === true
).value;

const invitationSchema = mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  tracker: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  teams: [],
  // member is the receiver, member == an user object
  members: [],
  // invited_by is also an user object, the person sending the invitation
  invited_by: {
    type: mongoose.Schema.Types.Mixed,
  },
  invited_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
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
invitationSchema.plugin(toJSON);
invitationSchema.plugin(paginate);

const Invitation = mongoose.model("Invitation", invitationSchema);
module.exports = Invitation;

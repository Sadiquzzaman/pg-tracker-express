const mongoose = require("mongoose");
const { toJSON, paginate } = require("../plugins");
const { lang } = require("../../config/lang");

const enumList = lang.teams.status.map((status) => status.value);
const defaultStatus = lang.teams.status.find(
  (status) => status.default === true
).value;

const teamSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
  },
  workspace: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  members: [],
  created_by: {
    type: String,
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
teamSchema.plugin(toJSON);
teamSchema.plugin(paginate);

const Team = mongoose.model("Team", teamSchema);
module.exports = Team;

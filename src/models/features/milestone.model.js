const mongoose = require("mongoose");
const { toJSON, paginate } = require("../plugins");
const { lang } = require("../../config/lang");

const enumTypeList = lang.milestones.types.map((type) => type.value);
const enumStatusList = lang.milestones.status.map((status) => status.value);
const defaultType = lang.milestones.types.find(
  (type) => type.default === true
).value;
const defaultStatus = lang.milestones.status.find(
  (status) => status.default === true
).value;

const milestoneSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    default: "yellow",
  },
  description: {
    type: String,
    required: false,
  },
  tracker: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  types: {
    type: String,
    enum: enumTypeList,
    default: defaultType,
  },
  status: {
    type: String,
    enum: enumStatusList,
    default: defaultStatus,
  },
  subTasks: [],
  teams: [],
  value: {
    type: String,
    trim: true,
  },
  start_date: {
    type: Date,
  },
  end_date: {
    type: Date,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  created_by: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

// add plugin that converts mongoose to json
milestoneSchema.plugin(toJSON);
milestoneSchema.plugin(paginate);

const Milestone = mongoose.model("Milestone", milestoneSchema);
module.exports = Milestone;

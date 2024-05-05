const mongoose = require("mongoose");
const { toJSON, paginate } = require("../plugins");
const { lang } = require("../../config/lang");

const enumList = lang.trackers.status.map((status) => status.value);
const defaultStatus = lang.trackers.status.find(
  (status) => status.default === true
).value;

const typeEnumList = lang.trackers.type.map((type) => type.value);
const defaultType = lang.trackers.type.find(
  (type) => type.default === true
).value;

const trackerSchema = mongoose.Schema({
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
  teams: [],
  subTasks: [],
  milestones: [],
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
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
  status_bar: {
    type: mongoose.Schema.Types.Mixed,
  },
  type: {
    type: String,
    enum: typeEnumList,
    default: defaultType,
  },
});

// add plugin that converts mongoose to json
trackerSchema.plugin(toJSON);
trackerSchema.plugin(paginate);

const Tracker = mongoose.model("Tracker", trackerSchema);
module.exports = Tracker;

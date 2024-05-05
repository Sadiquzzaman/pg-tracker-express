const mongoose = require("mongoose");
const { toJSON, paginate } = require("../plugins");
const { lang } = require("../../config/lang");

const enumList = lang.subTask.status.map((status) => status.value);
const defaultStatus = lang.subTask.status.find(
  (status) => status.default === true
).value;

const subTaskSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
  },
  tracker: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  assign_to: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
  },
  milestone: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
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
});

// add plugin that converts mongoose to json
subTaskSchema.plugin(toJSON);
subTaskSchema.plugin(paginate);

const SubTask = mongoose.model("SubTask", subTaskSchema);
module.exports = SubTask;

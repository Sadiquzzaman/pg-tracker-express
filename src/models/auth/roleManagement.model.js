const mongoose = require("mongoose");
const { toJSON, paginate } = require("../plugins");
const { lang } = require("../../config/lang");

const enumList = lang.accessRoles.roles.map((roles) => roles.value);
const defaultRole = lang.accessRoles.roles.find(
  (roles) => roles.default === true
).value;

const roleManagementSchema = mongoose.Schema({
  users: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  teams: [],
  trackers: [],
  // tasks: [],
});

// add plugin that converts mongoose to json
roleManagementSchema.plugin(toJSON);
roleManagementSchema.plugin(paginate);

const RoleManagement = mongoose.model("RoleManagement", roleManagementSchema);
module.exports = RoleManagement;

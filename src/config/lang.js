const { roles, role_lang } = require("../config/roles");
const lang = {
  users: {
    status: [
      {
        label: "Active",
        value: "active",
        default: true,
      },
      {
        label: "Inactive",
        value: "inactive",
      },
    ],
    role_lang,
  },
  invitations: {
    status: [
      { label: "Accepted", value: "accepted" },
      { label: "Rejected", value: "rejected" },
      { label: "Pending", value: "pending", default: true },
    ],
  },
  trackers: {
    status: [
      { label: "Active", value: "active", default: true },
      { label: "Inactive", value: "inactive" },
    ],
    type: [
      { label: "Milestone And Task", value: "both", default: true },
      { label: "Milestone", value: "milestone" },
      { label: "Task", value: "task" },
    ],
  },
  teams: {
    status: [
      { label: "Active", value: "active", default: true },
      { label: "Inactive", value: "inactive" },
    ],
    action: [
      { label: "Add", value: "add" },
      { label: "Delete", value: "delete" },
    ],
  },
  members: {
    status: [
      { label: "Active", value: "active", default: true },
      { label: "Inactive", value: "inactive" },
    ],
  },
  workspaces: {
    status: [
      { label: "Active", value: "active", default: true },
      { label: "Inactive", value: "inactive" },
    ],
  },
  milestones: {
    types: [
      { label: "Checkbox", value: "checkbox", default: true },
      { label: "Input", value: "input" },
    ],
    status: [
      { label: "Done", value: "done" },
      { label: "Pending", value: "pending", default: true },
    ],
  },

  accessRoles: {
    roles: [
      { label: "Editor", value: "edit" },
      { label: "Board Lead", value: "board_lead" },
      { label: "Viewer", value: "view", default: true },
    ],
  },
  subTask: {
    status: [
      { label: "To Do", value: "todo", default: true },
      { label: "In Progress", value: "inProgress" },
      { label: "Development Done", value: "developmentDone" },
      { label: "QA Test", value: "qaTest" },
      { label: "Done", value: "done" },
    ],
  },
};

module.exports = {
  lang,
};

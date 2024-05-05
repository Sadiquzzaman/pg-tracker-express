const allRoles = {
  user: ["manageUsers", "getWorkspaces"],
  admin: [
    "getUsers",
    "manageUsers",
    "getMembers",
    "manageMembers",
    "getWorkspaces",
    "manageWorkspaces",
    "manageInvitations",
    "manageTrackers",
    "getTrackres",
    "getTeams",
    "manageTeams",
    "getComments",
    "manageComments",
    "getMilestones",
    "manageMilestones",
    "getRoleManagements",
    "manageRoleManagements",
    "getSubTask",
    "manageSubTask",
  ],
  boardAdmin: [],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));
const role_lang = [];
roles.forEach((role) => {
  role_lang.push({
    label: role.charAt(0).toUpperCase() + role.slice(1),
    value: role,
  });
});

module.exports = {
  roles,
  roleRights,
  role_lang,
};

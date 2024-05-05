const httpStatus = require("http-status");
const {
  trackerService,
  tokenService,
  userService,
  workspaceService,
  teamService,
} = require("../../services");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");
const { RoleManagement } = require("../../models");

/**
 * Create a task
 * @param {Object} roleManagementBody
 * @returns {Promise<Member>}
 */
const createRoleManagement = async (roleManagementBody, token) => {
  for (let i = 0; i < roleManagementBody.length; i++) {
    const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);

    const userDetails = await userService.getUserById(
      roleManagementBody[i].memberId,
      token
    );
    if (!userDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    roleManagementBody[i].users = userDetails;

    for (let j = 0; j < roleManagementBody[i].teams.length; j++) {
      if (roleManagementBody[i].teams[j]) {
        const teamDetails = await teamService.getTeamById(
          roleManagementBody[i].teams[j].id
        );
        if (!teamDetails) {
          throw new ApiError(httpStatus.NOT_FOUND, "Team not found");
        }
        roleManagementBody[i].teams[j].id = teamDetails.id;
        roleManagementBody[i].teams[j].name = teamDetails.name;
        roleManagementBody[i].teams[j].role =
          roleManagementBody[i].teams[j].role;
        const workspaceDetails = await workspaceService.getWorkspaceById(
          roleManagementBody[i].teams[j].workspaceId,
          token
        );
        if (!workspaceDetails) {
          throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
        }
        delete roleManagementBody[i].teams[j].workspaceId;
        roleManagementBody[i].teams[j].workspace = {
          id: workspaceDetails.id,
          name: workspaceDetails.name,
          status: workspaceDetails.status,
          created_by: workspaceDetails.created_by,
          created_at: workspaceDetails.created_at,
        };
      }
    }

    if (roleManagementBody[i].trackers) {
      const trackerDetails = await trackerService.getTrackerById(
        roleManagementBody[i].trackers.id
      );
      if (!trackerDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tracker not found");
      }
      roleManagementBody[i].trackers.id = trackerDetails.id;
      roleManagementBody[i].trackers.name = trackerDetails.name;
      roleManagementBody[i].trackers.role;
    }

    roleManagementBody[i].created_by = tokenDoc.user.id;
  }

  return RoleManagement.create(roleManagementBody);
};

/**
 * Query for members
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @param {string} token
 * @returns {Promise<QueryResult>}
 */
const queryRoleManagement = async (filter, options, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const user = await userService.getUserById(tokenDoc.user);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Unauthorized");
  }

  filter = { "users.id": filter.userId };

  const roleManagement = await RoleManagement.paginate(filter, options);
  return roleManagement;
};

/**
 * Get task by id
 * @param {ObjectId} userId
 * @returns {Promise<RoleManagement>}
 */
const getRoleManagementByUserId = async (userId) => {
  const user = await userService.getUserById(userId);

  const roleManagement = await RoleManagement.findOne({
    "users._id": user._id,
  });

  if (!roleManagement) {
    throw new ApiError(httpStatus.NOT_FOUND, "Role Management not found");
  }

  return roleManagement;
};

/**
 * Update task by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<RoleManagement>}
 */
const updateRoleManagementByUserId = async (userId, updateBody, token) => {
  const roleManagement = await getRoleManagementByUserId(userId);
  if (!roleManagement) {
    throw new ApiError(httpStatus.NOT_FOUND, "Role Management not found");
  }

  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  // const user = await userService.getUserById(updateBody.userId);

  // updateBody.user = user;

  if (updateBody.teams) {
    for (let i = 0; i < updateBody.teams.length; i++) {
      const teamDetails = await teamService.getTeamById(updateBody.teams[i].id);
      if (!teamDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Team Not Found");
      }
      updateBody.teams[i].id = teamDetails.id;
      updateBody.teams[i].name = teamDetails.name;
      updateBody.teams[i].role = updateBody.teams[i].role;
      const workSpaceDetails = await workspaceService.getWorkspaceById(
        updateBody.teams[i].workspaceId,
        token
      );
      if (!workSpaceDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
      }
      delete updateBody.teams[i].workspaceId;
      updateBody.teams[i].workspace = {
        id: workSpaceDetails.id,
        name: workSpaceDetails.name,
        status: workSpaceDetails.status,
        created_by: workSpaceDetails.created_by,
        created_at: workSpaceDetails.created_at,
      };
    }
  }

  if (updateBody.trackers) {
    const trackerDetails = await trackerService.getTrackerById(
      updateBody.trackers.id
    );
    if (!trackerDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, "Tracker not found");
    }
    updateBody.trackers = trackerDetails;
  }

  updateBody.assign_by = tokenDoc.user;
  Object.assign(roleManagement, updateBody);
  await roleManagement.save();
  return roleManagement;
};

/**
 * Delete member by id
 * @param {ObjectId} userId
 * @returns {Promise<RoleManagement>}
 */
const deleteRoleManagementByUserId = async (userId, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const currentUser = await userService.getUserById(tokenDoc.user);
  if (!currentUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Unauthorized");
  }

  const roleManagement = await getRoleManagementByUserId(userId);
  if (!roleManagement) {
    throw new ApiError(httpStatus.NOT_FOUND, "No Role found");
  }
  await roleManagement.remove();
  return roleManagement;
};

module.exports = {
  createRoleManagement,
  queryRoleManagement,
  getRoleManagementByUserId,
  updateRoleManagementByUserId,
  deleteRoleManagementByUserId,
};

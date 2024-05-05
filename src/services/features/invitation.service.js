const httpStatus = require("http-status");
const { Invitation } = require("../../models");
const ApiError = require("../../utils/ApiError");
const { tokenTypes } = require("../../config/tokens");
const config = require("../../config/config");

const teamService = require("./team.service");
const trackerService = require("./tracker.service");

const tokenService = require("../auth/token.service");
const userService = require("../user/user.service");
const emailService = require("../auth/email.service");
const workspaceService = require("./workspace.service");

/**
 * Create a invitation
 * @param {Object} invitationBody
 * @returns {Promise<Invitation>}
 */
const createInvitation = async (invitationBody, token) => {
  const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  const invitor = await userService.getUserById(tokenDoc.user);
  if (!invitor) {
    throw new Error();
  }
  invitationBody.invited_by = invitor;

  if (invitationBody.members.length) {
    for (let i = 0; i < invitationBody.members.length; i++) {
      const memberDetails = await userService.getUserById(
        invitationBody.members[i].id
      );
      if (!memberDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Member Not Found");
      }
      invitationBody.members[i] = memberDetails;
    }
  }

  const workspaceDetails = await workspaceService.getWorkspaceById(
    invitationBody.workspace_id,
    token
  );

  invitationBody.workspace = workspaceDetails;

  if (invitationBody.tracker_id) {
    const trackerDetails = await trackerService.getTrackerById(
      invitationBody.tracker_id
    );
    invitationBody.tracker = trackerDetails;
  }

  if (invitationBody.teams.length) {
    for (let i = 0; i < invitationBody.teams.length; i++) {
      const teamDetails = await teamService.getTeamById(
        invitationBody.teams[i].id
      );
      if (!teamDetails) {
        throw new ApiError(httpStatus.NOT_FOUND, "Team Not Found");
      }
      invitationBody.teams[i] = teamDetails;
    }
  }

  const result = await Invitation.create(invitationBody);
  if (result) {
    if (invitationBody.members.length) {
      for (let i = 0; i < result.members.length; i++) {
        const subject = "Invitaion on workspace";
        const text = `Hi ${result.members[i].name}, 
      ${invitor.name} has send you an invitaion on his workspace/task.
      Here is your invitation link: ${config.app_url}:${config.port}/v1/invitations/${result.id}`;
        await emailService.sendEmail(result.members[i].email, subject, text);
      }
    }

    if (invitationBody.teams.length) {
      for (let i = 0; i < result.teams.length; i++) {
        for (let j = 0; j < result.teams[i].length; j++) {
          const subject = "Invitaion on workspace";
          const text = `Hi ${result.teams[i].members[j].name},
        ${invitor.name} has send you an invitaion on his workspace/task.
        Here is your invitation link: ${config.app_url}:${config.port}/v1/invitations/${result.id}`;
          await emailService.sendEmail(
            result.teams[i].members[j].name,
            subject,
            text
          );
        }
      }
    }
  }

  return result;
};

/**
 * Query for invitations
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryInvitations = async (filter, options) => {
  const invitations = await Invitation.paginate(filter, options);
  return invitations;
};

/**
 * Get invitation by id
 * @param {ObjectId} id
 * @returns {Promise<Invitation>}
 */
const getInvitationById = async (id) => {
  return Invitation.findById(id);
};

/**
 * Get invitation by member_id
 * @param {string} member_id
 * @returns {Promise<Invitation>}
 */
const getInvitationByMemberId = async (member_id) => {
  return Invitation.findOne({ "member.id": member_id });
};

/**
 * Update invitation by id
 * @param {ObjectId} invitationId
 * @param {Object} updateBody
 * @returns {Promise<Invitation>}
 */
const updateInvitationById = async (
  invitationId,
  updateBody,
  member,
  // tracker,
  workspace
) => {
  const invitation = await getInvitationById(invitationId);
  if (!invitation) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invitation not found");
  }

  // const tokenDoc = await tokenService.verifyToken(token, tokenTypes.ACCESS);
  // if (!member || member._id != invitation.member_id) {
  //   throw new ApiError(httpStatus.FORBIDDEN, "Unauthorised");
  // }

  if (member) {
    updateBody.member = member;
  }
  // if (tracker) {
  //   updateBody.tracker = tracker;
  // }
  if (workspace) {
    updateBody.workspace = workspace;
  }

  Object.assign(invitation, updateBody);
  await invitation.save();
  return invitation;
};

/**
 * Delete invitation by id
 * @param {ObjectId} invitationId
 * @returns {Promise<Invitation>}
 */
const deleteInvitationById = async (invitationId) => {
  const invitation = await getInvitationById(invitationId);
  if (!invitation) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invitation not found");
  }
  await invitation.remove();
  return invitation;
};

module.exports = {
  createInvitation,
  queryInvitations,
  getInvitationById,
  getInvitationByMemberId,
  updateInvitationById,
  deleteInvitationById,
};

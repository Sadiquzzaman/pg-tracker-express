const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const {
  invitationService,
  userService,
  tokenService,
  workspaceService,
} = require("../../services");

const createInvitation = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, "Token not found");
  }
  const invitation = await invitationService.createInvitation(req.body, token);

  res.status(httpStatus.CREATED).send(invitation);
});

const getInvitations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["workspaceId", "memberId", "status"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await invitationService.queryInvitations(filter, options);
  res.send(result);
});

const getInvitation = catchAsync(async (req, res) => {
  const invitation = await invitationService.getInvitationById(
    req.params.invitationId
  );
  if (!invitation) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invitation not found");
  }
  res.send(invitation);
});

const updateInvitation = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  if (!token) {
    throw new ApiError(httpStatus.NOT_FOUND, "Token not found");
  }
  const member = await userService.getUserById(req.body.member_id);
  // const tracker = await trackerService.getTrackerById(req.body.tracker_id); // tracker is the new task!
  const workspace = await workspaceService.getWorkspaceById(
    req.body.workspace_id,
    token
  );
  const invitation = await invitationService.updateInvitationById(
    req.params.invitationId,
    req.body,
    member,
    // tracker,
    workspace
  );
  res.send(invitation);
});

const deleteInvitation = catchAsync(async (req, res) => {
  await invitationService.deleteInvitationById(req.params.invitationId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createInvitation,
  getInvitations,
  getInvitation,
  updateInvitation,
  deleteInvitation,
};

const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const {
  trackerService,
  tokenService,
  workspaceService,
} = require("../../services");

const createTracker = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const tracker = await trackerService.createTracker(req.body, token);

  const workspaceDetails = await wrokspaceService.getWorkspaceById(
    req.body.workspace.id,
    token
  );
  if (!workspaceDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  let availableTrackers = [];
  if (workspaceDetails.trackers) {
    for (let i = 0; i < workspaceDetails.trackers.length; i++) {
      availableTrackers.push({ id: workspaceDetails.trackers[i]._id });
    }
  }

  tracker.workspace = {
    id: workspaceDetails.id,
    name: workspaceDetails.name,
    type: workspaceDetails.type,
    status: workspaceDetails.status,
  };

  availableTrackers.push({
    id: tracker._id,
  });

  const workspaceBody = {
    name: tracker.workspace.name,
    type: tracker.workspace.type,
    status: tracker.workspace.status,
    trackers: availableTrackers,
  };
  wrokspaceService.updateWorkspaceById(
    tracker.workspace.id,
    workspaceBody,
    token
  );
  res.status(httpStatus.CREATED).send(tracker);
});

const getTrackres = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "name",
    "workspace_id",
    "member_id",
    "team_id",
    "subtask_id",
    "status",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await trackerService.queryTrackres(filter, options);
  res.send(result);
});

const getTracker = catchAsync(async (req, res) => {
  const tracker = await trackerService.getTrackerById(req.params.trackerId);
  if (!tracker) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tracker not found");
  }
  res.send(tracker);
});

const updateTracker = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const tracker = await trackerService.updateTrackerById(
    req.params.trackerId,
    req.body,
    token
  );

  const workspaceDetails = await workspaceService.getWorkspaceById(
    tracker.workspace.id,
    token
  );

  if (!workspaceDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  let availableTrackers = [];
  if (workspaceDetails.trackers) {
    for (let i = 0; i < workspaceDetails.trackers.length; i++) {
      availableTrackers.push({ id: workspaceDetails.trackers[i]._id });
    }
  }

  let workSpaceBody = [];
  workSpaceBody.trackers = availableTrackers;

  wrokspaceService.updateWorkspaceById(
    tracker.workspace.id,
    workSpaceBody,
    token
  );
  res.send(tracker);
});

const deleteTracker = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const deletedTracker = await trackerService.deleteTrackerById(
    req.params.trackerId
  );

  const workspaceDetails = await workspaceService.getWorkspaceById(
    deletedTracker.workspace.id,
    token
  );

  if (!workspaceDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Workspace not found");
  }

  let availableTrackers = [];
  if (workspaceDetails.trackers) {
    for (let i = 0; i < workspaceDetails.trackers.length; i++) {
      availableTrackers.push({ id: workspaceDetails.trackers[i]._id });
    }
  }

  availableTrackers = availableTrackers.filter(
    (tracker) => tracker.id.toString() !== deletedTracker._id.toString()
  );
  let workSpaceBody = [];
  workSpaceBody.trackers = availableTrackers;

  wrokspaceService.updateWorkspaceById(
    workspaceDetails._id,
    workSpaceBody,
    token
  );
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTracker,
  getTrackres,
  getTracker,
  updateTracker,
  deleteTracker,
};

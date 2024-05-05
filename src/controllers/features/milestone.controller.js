const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const {
  milestoneService,
  tokenService,
  trackerService,
} = require("../../services");

const createMilestone = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const trackerDetails = await trackerService.getTrackerById(
    req.body.trackerId
  );
  let milestone;
  if (trackerDetails.type === "both" || trackerDetails.type === "milestone") {
    milestone = await milestoneService.createMilestone(
      req.body,
      trackerDetails,
      token
    );
  } else {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "This Tracker is task based");
  }

  // if (milestone) {
  //   trackerMilestoneDetails =
  //     await trackerService.calculateTrackerMilestonePercentage(
  //       trackerDetails.id
  //     );
  //   for (let i = 0; i < trackerMilestoneDetails.milestones.length; i++) {
  //     const milestoneId = trackerMilestoneDetails.milestones[i]._id;
  //     const percentage = trackerMilestoneDetails.milestones[i].percentage;
  //     await milestoneService.updateMilestoneById(
  //       milestoneId,
  //       { percentage },
  //       token
  //     );
  //   }
  //   milestone = await milestoneService.getMilestoneById(milestone.id);
  // }

  let availableMilestones = [];
  if (trackerDetails.milestones) {
    for (let i = 0; i < trackerDetails.milestones.length; i++) {
      availableMilestones.push({ id: trackerDetails.milestones[i]._id });
    }
  }

  availableMilestones.push({ id: milestone._id });

  let trackerBody = {};
  trackerBody.milestones = availableMilestones;
  trackerService.updateTrackerById(trackerDetails.id, trackerBody, token);

  res.status(httpStatus.CREATED).send(milestone);
});

const getMilestones = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "tracker_id"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await milestoneService.queryMilestones(filter, options);
  res.send(result);
});

const getMilestone = catchAsync(async (req, res) => {
  const milestone = await milestoneService.getMilestoneById(
    req.params.milestoneId
  );
  if (!milestone) {
    throw new ApiError(httpStatus.NOT_FOUND, "Milestone not found");
  }
  res.send(milestone);
});

const updateMilestone = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const milestone = await milestoneService.updateMilestoneById(
    req.params.milestoneId,
    req.body,
    token
  );

  const trackerDetails = await trackerService.getTrackerById(
    milestone.tracker.id
  );
  if (!trackerDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tracker Not Found");
  }

  let availableMilestones = [];
  if (trackerDetails.milestones) {
    for (let i = 0; i < trackerDetails.milestones.length; i++) {
      availableMilestones.push({ id: trackerDetails.milestones[i]._id });
    }
  }

  let trackerBody = {};
  trackerBody.milestones = availableMilestones;
  trackerService.updateTrackerById(trackerDetails.id, trackerBody, token);
  res.send(milestone);
});

const deleteMilestone = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const deletedMilestone = await milestoneService.deleteMilestoneById(
    req.params.milestoneId
  );

  const trackerDetails = await trackerService.getTrackerById(
    deletedMilestone.tracker.id
  );
  if (!trackerDetails) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tracker Not Found");
  }

  let availableMilestones = [];
  for (let i = 0; i < trackerDetails.milestones.length; i++) {
    availableMilestones.push({ id: trackerDetails.milestones[i]._id });
  }

  availableMilestones = availableMilestones.filter(
    (milestone) => milestone.id.toString() !== deletedMilestone._id.toString()
  );

  let trackerBody = {};
  trackerBody.milestones = availableMilestones;
  trackerService.updateTrackerById(trackerDetails.id, trackerBody, token);

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createMilestone,
  getMilestones,
  getMilestone,
  updateMilestone,
  deleteMilestone,
};

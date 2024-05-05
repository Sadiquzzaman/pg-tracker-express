const httpStatus = require("http-status");
const pick = require("../../utils/pick");
const ApiError = require("../../utils/ApiError");
const catchAsync = require("../../utils/catchAsync");
const {
  subTaskService,
  tokenService,
  trackerService,
  milestoneService,
} = require("../../services");

const createSubTask = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  let trackerDetails;
  if (req.body.trackerId) {
    trackerDetails = await trackerService.getTrackerById(req.body.trackerId);
    if (!trackerDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, "Tracker Not Found");
    }
  }

  let milestoneDetails;
  if (req.body.mileStoneId) {
    milestoneDetails = await milestoneService.getMilestoneById(
      req.body.mileStoneId
    );
    if (!milestoneDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, "MileStone Not Found");
    }
  }

  const subTask = await subTaskService.createSubTask(
    req.body,
    trackerDetails,
    milestoneDetails,
    token
  );

  if (req.body.trackerId) {
    let availableTasks = [];
    if (trackerDetails.subTasks) {
      for (let i = 0; i < trackerDetails.subTasks.length; i++) {
        availableTasks.push({ id: trackerDetails.subTasks[i]._id });
      }
    }
    for (let i = 0; i < subTask.length; i++) {
      availableTasks.push({ id: subTask[i].id });
    }
    let trackerBody = {};
    trackerBody.subTasks = availableTasks;
    trackerService.updateTrackerById(trackerDetails.id, trackerBody, token);
  }

  if (req.body.mileStoneId) {
    let availableSubTask = [];
    if (milestoneDetails.subTasks) {
      for (let i = 0; i < milestoneDetails.subTasks.length; i++) {
        availableSubTask.push({ id: milestoneDetails.subTasks[i]._id });
      }
    }
    for (let i = 0; i < subTask.length; i++) {
      availableSubTask.push({ id: subTask[i]._id });
    }
    let milestoneBody = {};
    milestoneBody.subTasks = availableSubTask;
    await milestoneService.updateMilestoneById(
      milestoneDetails.id,
      milestoneBody,
      token
    );
    let availableMilestone = [];
    const trackerDetails = await trackerService.getTrackerById(
      milestoneDetails.tracker.id
    );

    if (trackerDetails.milestones) {
      for (let i = 0; i < trackerDetails.milestones.length; i++) {
        availableMilestone.push({ id: trackerDetails.milestones[i]._id });
      }
    }
    let trackerBody = {};
    trackerBody.milestones = availableMilestone;
    trackerService.updateTrackerById(trackerDetails._id, trackerBody, token);
  }

  res.status(httpStatus.CREATED).send(subTask);
});

const getSubTasks = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    "name",
    "workspace_id",
    "member_id",
    "status",
  ]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await subTaskService.querySubTasks(filter, options);
  res.send(result);
});

const getSubTask = catchAsync(async (req, res) => {
  const subTask = await subTaskService.getSubTaskById(req.params.subTaskId);
  if (!subTask) {
    throw new ApiError(httpStatus.NOT_FOUND, "Sub Task not found");
  }
  res.send(subTask);
});

const updateSubTask = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const subTask = await subTaskService.updateSubTaskById(req.body, token);

  if (req.body.trackerId) {
    const trackerDetails = await trackerService.getTrackerById(
      req.body.trackerId
    );
    let availableTasks = [];
    if (trackerDetails.subTasks) {
      for (let i = 0; i < trackerDetails.subTasks.length; i++) {
        availableTasks.push({ id: trackerDetails.subTasks[i]._id });
      }
    }
    let trackerBody = {};
    trackerBody.subTasks = availableTasks;
    trackerService.updateTrackerById(trackerDetails.id, trackerBody, token);
  }

  if (req.body.milestoneId) {
    const milestoneDetails = await milestoneService.getMilestoneById(
      req.body.milestoneId
    );
    if (!milestoneDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, "MileStone Not Found");
    }

    let availableSubTasks = [];
    if (milestoneDetails.subTasks) {
      for (let i = 0; i < milestoneDetails.subTasks.length; i++) {
        availableSubTasks.push({ id: milestoneDetails.subTasks[i]._id });
      }
    }
    let milestoneBody = {};
    milestoneBody.subTasks = availableSubTasks;
    await milestoneService.updateMilestoneById(
      milestoneDetails.id,
      milestoneBody,
      token
    );

    let availableMilestone = [];
    const trackerDetails = await trackerService.getTrackerById(
      milestoneDetails.tracker.id
    );

    if (trackerDetails.milestones) {
      for (let i = 0; i < trackerDetails.milestones.length; i++) {
        availableMilestone.push({ id: trackerDetails.milestones[i]._id });
      }
    }
    let trackerBody = {};
    trackerBody.milestones = availableMilestone;
    trackerService.updateTrackerById(trackerDetails._id, trackerBody, token);
  }

  res.send(subTask);
});

const deleteSubTask = catchAsync(async (req, res) => {
  const token = await tokenService.getToken(req);
  const deletedTask = await subTaskService.deleteSubTaskById(
    req.params.subTaskId
  );

  if (deletedTask.tracker) {
    const trackerDetails = await trackerService.getTrackerById(
      deletedTask.tracker._id
    );
    let availableTasks = [];
    if (trackerDetails.subTasks) {
      for (let i = 0; i < trackerDetails.subTasks.length; i++) {
        availableTasks.push({ id: trackerDetails.subTasks[i]._id });
      }
    }

    availableTasks = availableTasks.filter(
      (task) => task.id.toString() !== deletedTask._id.toString()
    );

    let trackerBody = {};
    trackerBody.subTasks = availableTasks;
    trackerService.updateTrackerById(trackerDetails.id, trackerBody, token);
  }

  if (deletedTask.milestone) {
    const mileStoneDetails = await milestoneService.getMilestoneById(
      deletedTask.milestone._id
    );
    let availableTasks = [];
    if (mileStoneDetails.subTasks) {
      for (let i = 0; i < mileStoneDetails.subTasks.length; i++) {
        availableTasks.push({ id: mileStoneDetails.subTasks[i]._id });
      }
    }

    availableTasks = availableTasks.filter(
      (task) => task.id.toString() !== deletedTask._id.toString()
    );

    let milestoneBody = {};
    milestoneBody.subTasks = availableTasks;
    milestoneService.updateMilestoneById(
      mileStoneDetails.id,
      milestoneBody,
      token
    );

    let availableMilestone = [];
    const trackerDetails = await trackerService.getTrackerById(
      mileStoneDetails.tracker.id
    );

    if (trackerDetails.milestones) {
      for (let i = 0; i < trackerDetails.milestones.length; i++) {
        availableMilestone.push({ id: trackerDetails.milestones[i]._id });
      }
    }
    let trackerBody = {};
    trackerBody.milestones = availableMilestone;
    trackerService.updateTrackerById(trackerDetails._id, trackerBody, token);
  }

  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createSubTask,
  getSubTasks,
  getSubTask,
  updateSubTask,
  deleteSubTask,
};

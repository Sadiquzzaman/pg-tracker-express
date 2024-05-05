const express = require("express");
const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const milestoneValidation = require("../../../validations/feature/milestone.validation");
const milestoneController = require("../../../controllers/features/milestone.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth("manageMilestones"),
    validate(milestoneValidation.createMilestone),
    milestoneController.createMilestone
  )
  .get(
    auth("getMilestones"),
    validate(milestoneValidation.getMilestones),
    milestoneController.getMilestones
  );

router
  .route("/:milestoneId")
  .get(
    auth("getMilestones"),
    validate(milestoneValidation.getMilestone),
    milestoneController.getMilestone
  )
  .patch(
    auth("manageMilestones"),
    validate(milestoneValidation.updateMilestone),
    milestoneController.updateMilestone
  )
  .delete(
    auth("manageMilestones"),
    validate(milestoneValidation.deleteMilestone),
    milestoneController.deleteMilestone
  );

module.exports = router;

const express = require("express");
const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const memberValidation = require("../../../validations/user/member.validation");
const memberController = require("../../../controllers/user/member.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth("manageMembers"),
    validate(memberValidation.createMember),
    memberController.createMember
  )
  .get(
    auth("getMembers"),
    validate(memberValidation.getMembers),
    memberController.getMembers
  );

router.get(
  "/:memberId",
  validate(memberValidation.getmember),
  memberController.getMember
);
router.patch(
  "/:memberId",
  validate(memberValidation.updateMember),
  memberController.updateMember
);
router.delete(
  "/:memberId",
  validate(memberValidation.deleteMember),
  memberController.deleteMember
);

module.exports = router;

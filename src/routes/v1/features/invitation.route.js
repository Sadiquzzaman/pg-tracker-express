const express = require("express");
const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const invitationValidation = require("../../../validations/feature/invitation.validation");
const invitationController = require("../../../controllers/features/invitation.controller");

const router = express.Router();

router.post(
  "/",
  auth("manageInvitations"),
  validate(invitationValidation.createInvitation),
  invitationController.createInvitation
);
router.get(
  "/",
  auth("manageInvitations"),
  validate(invitationValidation.getInvitations),
  invitationController.getInvitations
);

router.get(
  "/:invitationId",
  auth("manageInvitations"),
  validate(invitationValidation.getInvitation),
  invitationController.getInvitation
);
router.patch(
  "/:invitationId",
  auth("manageInvitations"),
  validate(invitationValidation.updateInvitation),
  invitationController.updateInvitation
);
router.delete(
  "/:invitationId",
  auth("manageInvitations"),
  validate(invitationValidation.deleteInvitation),
  invitationController.deleteInvitation
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Invitation management and retrieval
 */

/**
 * @swagger
 * /invitations:
 *   post:
 *     summary: Create a Invitation
 *     description: Only admins can create other Invitations.
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workspace_id
 *               - member_id
 *             properties:
 *               workspace_id:
 *                 type: string
 *               member_id:
 *                 type: string
 *               status:
 *                  type: string
 *                  enum: [accepted, rejected, pending]
 *             example:
 *               name:  Invitation 1
 *               workspace_id: abcd1234
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Invitation'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all Invitations
 *     description: Only admins can retrieve all Invitations.
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: workspace_id
 *         schema:
 *           type: string
 *         description: workspace ID invitation belongs to
 *       - in: query
 *         name: member_id
 *         schema:
 *           type: string
 *         description: member ID invitation belongs to
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Invitation status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of Invitations
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invitation'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /invitations/{id}:
 *   get:
 *     summary: Get a Invitation
 *     description: Logged in users can fetch only their own Invitation information. Only admins can fetch other Invitations.
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Invitation'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a Invitation
 *     description: Logged in Invitation admins the Invitation information they have rights to.
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workspace_id:
 *                 type: string
 *               member_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *             example:
 *               workspace_id: abcd1234
 *               member_id: 1234abcd
 *               status: accepted
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Invitation'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a Invitation
 *     description: Logged in Invitation admins can delete other Invitations.
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invitation id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

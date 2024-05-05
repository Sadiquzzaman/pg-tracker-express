const express = require("express");
const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const roleManagementValidation = require("../../../validations/auth/roleManagement.validation");
const roleManagementController = require("../../../controllers/auth/roleManagement.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth("manageRoleManagements"),
    validate(roleManagementValidation.createRoleManagement),
    roleManagementController.createRoleManagement
  )
  .get(
    auth("getRoleManagements"),
    validate(roleManagementValidation.getRoleManagements),
    roleManagementController.getRoleManagements
  );

router
  .route("/:userId")
  .get(
    auth("getRoleManagements"),
    validate(roleManagementValidation.getRoleManagement),
    roleManagementController.getRoleManagement
  )
  .patch(
    auth("manageTrackers"),
    validate(roleManagementValidation.updateRoleManagement),
    roleManagementController.updateRoleManagement
  )
  .delete(
    auth("manageTrackers"),
    validate(roleManagementValidation.deleteRoleManagement),
    roleManagementController.deleteRoleManagement
  );

module.exports = router;

/**
 * @swagger
 * /roleManagements:
 *   post:
 *     summary: Create a roleManagements
 *     description: Only admins can create other roleManagements.
 *     tags: [roleManagements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *              type: array
 *              properties:
 *                memberId:
 *                  type: string
 *                workspaces:
 *                  type: object
 *                trackers:
 *                  type: object
 *
 *              example:
 *                    - memberId: "64749c0538b2febbe52b1a5e"
 *                      workspaces:
 *                        id: "6475b8c1dd130652949c0c4a"
 *                        role: "board_lead"
 *                      trackers:
 *                        id: "6475b95ddd130652949c0c63"
 *                        role: "view"
 *                    - memberId: "64749c0538b2febbe52b1a5e"
 *                      workspaces:
 *                        id: "6475b8e8dd130652949c0c50"
 *                        role: "board_lead"
 *                      trackers:
 *                        id: "645b5cf75fd2885b38763bf7"
 *                        role: "edit"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/roleManagements'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all roleManagements
 *     description: Only admins can retrieve all roleManagements.
 *     tags: [roleManagements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: uuid
 *         description: User Id
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
 *         description: Maximum number of roleManagements
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
 *                     $ref: '#/components/schemas/roleManagements'
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
 * /roleManagements/{id}:
 *   get:
 *     summary: Get a roleManagements by user id
 *     description: Logged in users can fetch only their own roleManagements information. Only admins can fetch other roleManagements.
 *     tags: [roleManagements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: user id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/roleManagements'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a roleManagements
 *     description: Logged in roleManagements admins the roleManagements information they have rights to.
 *     tags: [roleManagements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             properties:
 *               memberId:
 *                 type: string
 *               workspaces:
 *                 type: object
 *               trackers:
 *                 type: object
 *             example:
 *                workspaces:
 *                   id: "6475b8c1dd130652949c0c4a"
 *                   role: "board_lead"
 *                trackers:
 *                   id: "6475b95ddd130652949c0c63"
 *                   role: "view"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/roleManagements'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a roleManagements
 *     description: Logged in roleManagements admins can delete other roleManagements.
 *     tags: [roleManagements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: user id
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

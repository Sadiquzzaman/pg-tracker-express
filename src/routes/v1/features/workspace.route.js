const express = require("express");
const auth = require("../../../middlewares/auth");
const validate = require("../../../middlewares/validate");
const workspaceValidation = require("../../../validations/feature/workspace.validation");
const workspaceController = require("../../../controllers/features/workspace.controller");

const router = express.Router();

router
  .route("/")
  .post(
    auth("manageWorkspaces"),
    validate(workspaceValidation.createWorkspace),
    workspaceController.createWorkspace
  )
  .get(
    auth("getWorkspaces"),
    validate(workspaceValidation.getWorkspaces),
    workspaceController.getWorkspaces
  );

router
  .route("/:workspaceId")
  .get(
    auth("getWorkspaces"),
    validate(workspaceValidation.getWorkspace),
    workspaceController.getWorkspace
  )
  .patch(
    auth("manageWorkspaces"),
    validate(workspaceValidation.updateWorkspace),
    workspaceController.updateWorkspace
  )
  .delete(
    auth("manageWorkspaces"),
    validate(workspaceValidation.deleteWorkspace),
    workspaceController.deleteWorkspace
  );

module.exports = router;

/**
 * @swagger
 * /workspaces:
 *   post:
 *     summary: Create a workspace
 *     description: Only admins can create other workspaces.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               members:
 *                  type: object
 *               status:
 *                  type: string
 *                  enum: [active, inactive]
 *             example:
 *               name:  Workspace 1
 *               description: Workspace description
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Workspace'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all workspaces
 *     description: Only admins can retrieve all workspaces.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Workspace name
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Workspace status
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
 *         description: Maximum number of workspaces
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
 *                     $ref: '#/components/schemas/Workspace'
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
 * /workspaces/{id}:
 *   get:
 *     summary: Get a Workspace
 *     description: Logged in users can fetch only their own Workspace information. Only admins can fetch other workspaces.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Workspace'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a Workspace
 *     description: Logged in workspace admins the workspace information they have rights to.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               members:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *             example:
 *               name: Workspace 002
 *               type: workspace type
 *               description: workspace for software development project XYZ
 *               members: []
 *               status: active
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Workspace'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a Workspace
 *     description: Logged in workspace admins can delete other workspaces.
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workspace id
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

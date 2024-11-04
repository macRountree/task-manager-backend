import {Router} from 'express';
import {body, param} from 'express-validator';
import {ProjectController} from '../controllers/ProjectController';
import {handleInputErrors} from '../middleware/validation';
import {TaskController} from '../controllers/TaskController';
import {validateProjectExist} from '../middleware/project';
import {hasAuth, taskBelongsToProject, TaskExist} from '../middleware/task';
import {authenticate} from '../middleware/auth';
import {TeamController} from '../controllers/TeamController';
import {NoteController} from '../controllers/NoteController';

const router = Router();

router.use(authenticate); //*auth middleware have to be before validation

router.post(
  '/',
  body('projectName').notEmpty().withMessage('Project Name is required'),
  body('clientName').notEmpty().withMessage('Client Name is required'),
  body('description').notEmpty().withMessage('description is required'),
  handleInputErrors,
  ProjectController.createProject
);
router.get('/', ProjectController.getAllProjects);
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid Project Id'),
  handleInputErrors,
  ProjectController.getProjectById
);
//*router.param() used to validate projectId(param) before executing the route
router.param('projectId', validateProjectExist);
router.put(
  '/:projectId',
  param('projectId').isMongoId().withMessage('Invalid Project Id'),
  body('projectName').notEmpty().withMessage('Project Name is required'),
  body('clientName').notEmpty().withMessage('Client Name is required'),
  body('description').notEmpty().withMessage('description is required'),
  handleInputErrors,
  hasAuth,
  ProjectController.updateProject
);
router.delete(
  '/:projectId',
  param('projectId').isMongoId().withMessage('Invalid Project Id'),
  handleInputErrors,
  hasAuth,
  ProjectController.deleteProject
);
//*task routes

router.post(
  '/:projectId/tasks',
  hasAuth,
  // validateProjectExist, //* moved to router.param()
  body('taskName').notEmpty().withMessage('task Name is required'),
  body('description').notEmpty().withMessage(' task description is required'),
  handleInputErrors,
  TaskController.createTask
);

router.get(
  '/:projectId/tasks',
  // validateProjectExist, //* moved to router.param()
  TaskController.getAllTasksByProject
);

router.param('taskId', TaskExist);
router.param('taskId', taskBelongsToProject);
router.get(
  '/:projectId/tasks/:taskId',
  // validateProjectExist,  //* moved to router.param()
  param('taskId').isMongoId().withMessage('Invalid Task Id'),
  handleInputErrors,
  TaskController.getTaskById
);
router.put(
  '/:projectId/tasks/:taskId',
  hasAuth,
  // validateProjectExist,  //* moved to router.param()
  param('taskId').isMongoId().withMessage('Invalid Task Id'),
  body('taskName').notEmpty().withMessage('task Name is required'),
  body('description').notEmpty().withMessage(' task description is required'),
  handleInputErrors,
  TaskController.updateTask
);
router.delete(
  '/:projectId/tasks/:taskId',
  hasAuth,
  // validateProjectExist,  //* moved to router.param()
  param('taskId').isMongoId().withMessage('Invalid Task Id'),
  handleInputErrors,
  TaskController.deleteTask
);

//* change task status

router.post(
  '/:projectId/tasks/:taskId/status',
  hasAuth,
  param('taskId').isMongoId().withMessage('Invalid Task Id'),
  body('status').notEmpty().withMessage('Status is required'),
  TaskController.updateTaskStatus
);
//*===========Team routes
//* find member by email
router.post(
  '/:projectId/team/find',
  body('email').isEmail().toLowerCase().withMessage('Invalid Email'),
  handleInputErrors,
  TeamController.findMemberByEmail
);

router.get('/:projectId/team', TeamController.getAllMembers);

//* add member to project
router.post(
  '/:projectId/team',
  body('id').isMongoId().withMessage('Invalid User Id'),
  handleInputErrors,
  TeamController.addMemberById
);

//* remove member from project
router.delete(
  '/:projectId/team/:userId',
  param('userId').isMongoId().withMessage('Invalid User Id'),
  handleInputErrors,
  TeamController.removeMemberById
);
//! ROUTES NOTES
router.post(
  '/:projectId/tasks/:taskId/notes',
  body('content').notEmpty().withMessage('Content is required'), //*check Note Model
  handleInputErrors,
  NoteController.createNote
);
router.get('/:projectId/tasks/:taskId/notes', NoteController.getTaskNotes);
router.delete(
  '/:projectId/tasks/:taskId/notes/:noteId',
  param('noteId').isMongoId().withMessage('Invalid Note Id'),
  handleInputErrors,
  NoteController.deleteNote
);
export default router;

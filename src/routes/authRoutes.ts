import {Router} from 'express';
import {AuthController} from '../controllers/AuthController';
import {body, param} from 'express-validator';
import {handleInputErrors} from '../middleware/validation';
import {authenticate} from '../middleware/auth';

const router = Router();

//*auth routes

router.post(
  '/register-user',
  body('name').notEmpty().withMessage('Name is required'),
  body('password')
    .isLength({min: 8})
    .withMessage('password must be at least 8 characters'),
  body('password_confirmation').custom((value, {req}) => {
    console.log(value, 'from custom');
    console.log(req.body.password, 'from custom req');
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('email').isEmail().withMessage('Invalid email'),
  handleInputErrors,
  AuthController.registerUser
);
router.post(
  '/confirm-account',
  body('token').notEmpty().withMessage('Token is required'),
  handleInputErrors,
  AuthController.confirmAccount
);
router.post(
  '/login',
  body('email').isEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleInputErrors,
  AuthController.login
);
router.post(
  '/request-code',
  body('email').isEmail().withMessage('Invalid email'),
  handleInputErrors,
  AuthController.requestNewCode
);
router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('Invalid email'),
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  '/validate-token',
  body('token').notEmpty().withMessage('Token is required'),

  handleInputErrors,
  AuthController.validateToken
);
router.post(
  '/update-password/:token',
  param('token').isNumeric().withMessage('Invalid token'),
  body('password')
    .isLength({min: 8})
    .withMessage('password must be at least 8 characters'),
  body('password_confirmation').custom((value, {req}) => {
    // console.log(value, 'from custom');
    // console.log(req.body.password, 'from custom req');
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
);

router.get('/user', authenticate, AuthController.getUser);

//*Profile routes
router.put(
  '/profile',
  authenticate,
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email'),
  AuthController.updateProfile
);

router.post(
  '/update-password',
  authenticate,
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('password')
    .isLength({min: 8})
    .withMessage('password must be at least 8 characters'),
  body('password_confirmation').custom((value, {req}) => {
    // console.log(value, 'from custom');
    // console.log(req.body.password, 'from custom req');
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);
router.post(
  '/check-password',
  authenticate,
  body('password').notEmpty().withMessage('Password is required'),
  handleInputErrors,
  AuthController.checkPassword
);
export default router;

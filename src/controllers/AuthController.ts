import {Request, Response} from 'express';
import User from '../models/Auth';
import {comparePassword, hashPassword} from '../helpers/helpers';
import Token from '../models/Token';
import {genToken} from '../helpers/token';
import {AuthEmail} from '../emails/AuthEmail';
import {generateJWT} from '../helpers/jwt';
import {body} from 'express-validator';

export class AuthController {
  static registerUser = async (req: Request, res: Response) => {
    try {
      //*Check dB if user exists by emails

      const {password, email} = req.body;
      const userExist = await User.findOne({email});
      if (userExist) {
        const error = new Error('User already exists');
        return res.status(409).json({error: error.message});
        // return res.status(400).send({error: 'User already exists'})
      }
      const user = new User(req.body);
      //*Hash the password
      user.password = await hashPassword(password);

      //*Generate token
      const token = new Token();
      token.token = genToken();
      token.user = user.id;

      //send email
      await AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      await user.save();
      res.send(
        'User registered successfully. Please check your email to confirm your account'
      );
    } catch (error) {
      res.status(500).send({error: 'Internal server error'});
    }
  };
  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const {token} = req.body;
      console.log(token, 'from confirm account');

      //*Token validation
      const tokenExist = await Token.findOne({token});
      // console.log(tokenExist, 'from token exist');
      if (!tokenExist) {
        const error = new Error('Invalid token');
        return res.status(404).json({error: error.message});
      }
      //*! when Token is found, change user confirmed to true
      //*User validation inside token (need User model)
      const user = await User.findById(tokenExist.user);
      user.confirmed = true;
      //*Save User confirmation and delete token (dont need token anymore)
      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
      res.send('Account confirmed successfully');
    } catch (error) {
      res.status(500).send({error: 'Internal server error'});
    }
  };
  //!end of confirmAccount
  static login = async (req: Request, res: Response) => {
    try {
      const {email, password} = req.body;
      const user = await User.findOne({email});
      if (!user) {
        const error = new Error('User not found');
        return res.status(404).json({error: error.message});
      }
      if (!user.confirmed) {
        const newToken = new Token();
        newToken.user = user.id;
        newToken.token = genToken();
        await newToken.save();

        //send email
        await AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: newToken.token,
        });

        const error = new Error(
          'User Account not confirmed, We sent you a new token at your email'
        );
        return res.status(401).json({error: error.message});
      }
      //*Check password , create helperfn comparePassword, password from req.body, user.password stored in dB will be compared
      const isPasswordMatch = await comparePassword(password, user.password);
      if (!isPasswordMatch) {
        const error = new Error('Invalid password');
        return res.status(401).json({error: error.message});
      }
      //*generate JWT token
      const jwtToken = generateJWT({
        id: user.id,
      });
      res.send(jwtToken); //*just need id
    } catch (error) {
      res.status(500).send({error: 'Internal server error'});
    }
  };
  static requestNewCode = async (req: Request, res: Response) => {
    try {
      // //*Only email is required
      const {email} = req.body;
      //*Check if user exists
      const userExist = await User.findOne({email});
      if (!userExist) {
        const error = new Error('User not found');
        return res.status(404).json({error: error.message});
      }
      console.log(userExist, 'from request new code');
      //*Check if user is confirmed
      if (userExist.confirmed) {
        const error = new Error('User account already confirmed');
        return res.status(403).json({error: error.message});
      }
      const token = new Token();
      token.token = genToken();
      token.user = userExist.id;

      AuthEmail.sendConfirmationEmail({
        email: userExist.email,
        name: userExist.name,
        token: token.token,
      });

      await Promise.allSettled([userExist.save(), token.save()]);
      res.send('New token sent to your email');
    } catch (error) {
      res.status(500).send({error: 'Internal server error'});
    }
  };
  static forgotPassword = async (req: Request, res: Response) => {
    try {
      // //*Only email is required
      const {email} = req.body;
      //*Check if user exists
      const userExist = await User.findOne({email});
      if (!userExist) {
        const error = new Error('User not found');
        return res.status(404).json({error: error.message});
      }
      console.log(userExist, 'from forgot password');

      const token = new Token();
      token.token = genToken();
      token.user = userExist.id;

      await token.save();
      AuthEmail.sendPasswordResetToken({
        email: userExist.email,
        name: userExist.name,
        token: token.token,
      });

      res.send('Check your email to reset your password');
    } catch (error) {
      res.status(500).send({error: 'Internal server error'});
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const {token} = req.body;
      const tokenExist = await Token.findOne({token});
      if (!tokenExist) {
        const error = new Error('Invalid token');
        return res.status(404).json({error: error.message});
      }

      res.send('Token is valid, you can reset your password');
    } catch (error) {
      res.status(500).send({error: 'Internal server error'});
    }
  };

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try {
      const {token} = req.params;
      const {password} = req.body;
      const tokenExist = await Token.findOne({token});
      if (!tokenExist) {
        const error = new Error('Invalid token');
        return res.status(404).json({error: error.message});
      }
      const user = await User.findById(tokenExist.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
      res.send('Password updated successfully');
    } catch (error) {
      res.status(500).send({error: 'Internal server error'});
    }
  };

  static getUser = async (req: Request, res: Response) => {
    return res.json(req.user);
  };
  static updateProfile = async (req: Request, res: Response) => {
    const {name, email} = req.body;

    const userExist = await User.findOne({email});

    if (userExist && userExist.id.toString() !== req.user.id.toString()) {
      const error = new Error('User already exists');
      return res.status(409).json({error: error.message});
    }

    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.send('Profile updated successfully');
    } catch (error) {
      res.status(500).send({error: 'Internal server error'});
    }
  };
  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const {current_password, password} = req.body;

    const user = await User.findById(req.user.id);
    const isPasswordCorrect = await comparePassword(
      current_password,
      user.password
    );

    if (!isPasswordCorrect) {
      const error = new Error('Current password is incorrect');
      return res.status(401).json({error: error.message});
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.send('Password updated successfully');
    } catch (error) {
      res.status(500).send({error: 'Internal server error'});
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const {password} = req.body;
    const user = await User.findById(req.user.id);
    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      const error = new Error('Password is incorrect');
      return res.status(401).json({error: error.message});
    }
    res.send('Password is correct');
  };
}

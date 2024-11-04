import type {Request, Response} from 'express';
import User from '../models/Auth';
import Project from '../models/Project';

export class TeamController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const {email} = req.body;
    console.log(email, 'from Email');

    //* find the user by email
    const user = await User.findOne({
      email,
    }).select('id name email');

    if (!user) {
      const error = new Error('User not found , please check the email');
      return res.status(404).json({error: error.message});
    }

    res.json(user);
  };

  static getAllMembers = async (req: Request, res: Response) => {
    const members = await Project.findById(req.project.id).populate({
      path: 'team',
      select: 'id email name',
    });
    res.json(members.team);
  };

  static addMemberById = async (req: Request, res: Response) => {
    const {id} = req.body;
    console.log(id, 'addMemberById');
    const user = await User.findById(id).select('id');
    if (!user) {
      const error = new Error('User not found , please check the email');
      return res.status(404).json({error: error.message});
    }
    //*toString() convert the object id from DB to string
    if (req.project.team.some(team => team.toString() === user.id.toString())) {
      const error = new Error('User already in the project');
      return res.status(409).json({error: error.message});
    }
    req.project.team.push(user.id);

    await req.project.save();
    //*check if the user exist
    res.json('User added to the project');
  };
  static removeMemberById = async (req: Request, res: Response) => {
    const {userId} = req.params;
    console.log(userId, 'removeMemberById');

    if (!req.project.team.some(team => team.toString() === userId)) {
      const error = new Error('User not found in the project');
      return res.status(404).json({error: error.message});
    }

    req.project.team = req.project.team.filter(
      teamMember => teamMember.toString() !== userId
    );

    await req.project.save();
    res.json('User removed from the project');
  };
}

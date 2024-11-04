import {Request, Response} from 'express';
import Project from '../models/Project';
//* controllers must be Classes

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);
    //* assig manager to project
    project.manager = req.user.id;
    // res.send('From createProjectController');
    try {
      await project.save();
      res.send('Project created successfully');
    } catch (error) {
      console.log(error);
    }
  };
  static getAllProjects = async (req: Request, res: Response) => {
    try {
      // get projecst if the manager is the user
      const getprojects = await Project.find({
        $or: [{manager: {$in: req.user.id}}, {team: {$in: req.user.id}}],
      });
      res.json(getprojects);
    } catch (error) {
      console.log(error);
    }
  };
  static getProjectById = async (req: Request, res: Response) => {
    //*recovers the id from the request
    const {id} = req.params;
    // console.log(id);

    try {
      const getProjectById = await Project.findById(id).populate('tasks');

      if (!getProjectById) {
        const error = new Error('Project not found');
        return res.status(404).json({error: error.message});
      }

      if (
        getProjectById.manager.toString() !== req.user.id.toString() &&
        !getProjectById.team.includes(req.user.id)
      ) {
        const error = new Error('Invalid Action');
        return res.status(404).json({error: error.message});
      }

      res.json(getProjectById);
    } catch (error) {
      console.log(error);
    }
  };
  static updateProject = async (req: Request, res: Response) => {
    try {
      req.project.projectName = req.body.projectName;
      req.project.clientName = req.body.clientName;
      req.project.description = req.body.description;

      await req.project.save();
      res.send('Project updated successfully');
    } catch (error) {
      console.log(error);
    }
  };
  static deleteProject = async (req: Request, res: Response) => {
    try {
      await req.project.deleteOne();
      res.send('Project deleted successfully');
    } catch (error) {
      console.log(error);
    }
  };
}

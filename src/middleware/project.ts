import type {NextFunction, Request, Response} from 'express';
import Project from '../models/Project';
import {ProjectInterface} from '../models/Project';

declare global {
  namespace Express {
    interface Request {
      project: ProjectInterface;
    }
  }
}
export async function validateProjectExist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {projectId} = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      return res.status(404).json({error: error.message});
    }
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({error: 'Server error'});
  }
}

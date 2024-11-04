import type {NextFunction, Request, Response} from 'express';

import Task from '../models/Task';
import {TaskInterface} from '../models/Task';

declare global {
  namespace Express {
    interface Request {
      task: TaskInterface;
    }
  }
}

export async function TaskExist(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const {taskId} = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error('Task not found');
      return res.status(404).json({error: error.message});
    }
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({error: 'Server error'});
  }
}

export function taskBelongsToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.task.project.toString() !== req.project.id.toString()) {
    const error = new Error('Task not found in this project');
    return res.status(404).json({error: error.message});
  }
  next();
}
export function hasAuth(req: Request, res: Response, next: NextFunction) {
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error(
      'Unauthorized action, only the manager can do this action'
    );
    return res.status(404).json({error: error.message});
  }
  next();
}

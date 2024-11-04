import {Request, Response} from 'express';
import Task from '../models/Task';
export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task.id);

      //* can save two promises in parallel with allSettled()
      //* in this case, we are saving the task and the project and they exist already
      //   await task.save();
      //   await req.project.save(); save project until task is saved
      Promise.allSettled([task.save(), req.project.save()]); //* save project and task in parallel
      res.send('Task created successfully');
    } catch (error) {
      console.log(error);
    }
  };
  static getAllTasksByProject = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({project: req.project.id}).populate(
        //* populate need project reference in Task Schema
        'project'
      );
      res.json(tasks);
    } catch (error) {
      res.status(500).json({error: 'No tasks found'}); //* 500 for server error
    }
  };
  static getTaskById = async (req: Request, res: Response) => {
    try {
      //   const {taskId} = req.params;

      //   const task = await Task.findById(taskId);
      //   if (!task) {
      //     const error = new Error('Task not found');
      //     return res.status(404).json({error: error.message});
      //   }
      //   //* if MongoDB ObjectId, use toString()
      //   //   console.log(task.project, req.project.id);
      //   if (task.project.toString() !== req.project.id) {
      //     const error = new Error('Task not found in this project');
      //     return res.status(404).json({error: error.message});
      //   }

      const task = await Task.findById(req.task.id)
        .populate({
          path: 'completedBy.user',
          select: 'id name email',
        })
        .populate({path: 'notes', populate: 'createdBy'});
      res.json(task);
    } catch (error) {
      res.status(500).json({error: 'Task not found'});
    }
  };

  static updateTask = async (req: Request, res: Response) => {
    try {
      //   //* if MongoDB ObjectId, use toString()
      //   //   console.log(task.project, req.project.id);
      //   if (req.task.project.toString() !== req.project.id) {
      //     const error = new Error('Task not found in this project');
      //     return res.status(404).json({error: error.message});
      //   }

      req.task.taskName = req.body.taskName;
      req.task.description = req.body.description;
      await req.task.save();
      res.send('Task updated successfully');
    } catch (error) {
      res.status(500).json({error: 'Unable to update task'});
    }
  };
  static deleteTask = async (req: Request, res: Response) => {
    try {
      //   const {taskId} = req.params;
      //   const task = await Task.findById(taskId, req.body);
      //   if (!task) {
      //     const error = new Error('Task not found');
      //     return res.status(404).json({error: error.message});
      //   }
      //* if MongoDB ObjectId, use toString()
      //   console.log(task.project, req.project.id);
      //   if (req.task.project.toString() !== req.project.id) {
      //     const error = new Error('Task not found in this project');
      //     return res.status(404).json({error: error.message});
      //   }
      req.project.tasks = req.project.tasks.filter(
        task => task.toString() !== req.task.id.toString()
      );

      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);
      res.send('Task deleted successfully');
    } catch (error) {
      res.status(500).json({error: 'Server error. Unable to delete Task'}); //* 500 for server error
    }
  };
  static updateTaskStatus = async (req: Request, res: Response) => {
    try {
      const {status} = req.body;
      req.task.status = status;
      const data = {
        user: req.user.id,
        status,
      };
      req.task.completedBy.push(data);
      await req.task.save();
      res.send('Task status updated successfully');
    } catch (error) {
      res.status(500).json({error: 'Unable to update task status'});
    }
  };
}

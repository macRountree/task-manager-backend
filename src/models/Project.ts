import mongoose, {Schema, Document, PopulatedDoc, Types} from 'mongoose';
import Task, {TaskInterface} from './Task';
import {InterfaceUser} from './Auth';
import Note from './Note';
//*type definition for ProjectInterface
export interface ProjectInterface extends Document {
  projectName: string;
  clientName: string;
  description: string;
  tasks: PopulatedDoc<TaskInterface & Document>[]; //* One project can have multiple tasks
  manager: PopulatedDoc<InterfaceUser & Document>; //*Only one manager can be assigned to a project
  team: PopulatedDoc<InterfaceUser>[];
}

//*ProjectSchema mongoose schema

const ProjectSchema: Schema = new Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    tasks: [
      {
        type: Types.ObjectId,
        ref: 'Task',
      },
    ],
    manager: {
      type: Types.ObjectId,
      ref: 'User',
    },
    team: [
      {
        type: Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {timestamps: true}
);

//*if delete a Project, all task will be deleted too
ProjectSchema.pre('deleteOne', {document: true}, async function () {
  const projectId = this._id;
  if (!projectId) return;
  const tasks = await Task.find({project: projectId});
  for (const task of tasks) {
    await Note.deleteMany({task: task._id});
  }
  await Task.deleteMany({project: projectId});
});

const Project = mongoose.model<ProjectInterface>('Project', ProjectSchema);

export default Project;

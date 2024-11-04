import mongoose, {Schema, Document, Types} from 'mongoose';

export interface InterfaceToken extends Document {
  token: string;
  user: Types.ObjectId;
  createdAt: Date;
}

const tokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: 'User', //*reference to User model in ./models/Auth.ts
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    expires: '10m',
  },
});

const Token = mongoose.model<InterfaceToken>('Token', tokenSchema);

export default Token;

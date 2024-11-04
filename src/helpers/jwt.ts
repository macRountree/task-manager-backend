import jwt from 'jsonwebtoken';
import Types from 'mongoose';

//*We need payload to generate token so.. need create interface for payload
interface UserPayload {
  id: Types.ObjectId;
}
export const generateJWT = (payload: UserPayload) => {
  //*just need minimal data for token

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '5d',
  });

  return token;
};

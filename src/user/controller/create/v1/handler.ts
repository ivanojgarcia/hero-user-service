import { User } from '@user/model/UserModel';
import { validateUserCreate } from '@user/utils/validation';
import { saveUser } from '@user/service/UserService';
import { UserRecord, UserRequest } from '@user/interface/user.interfaces';

export const createUser = async (userData: UserRequest): Promise<UserRecord> => {
  const { email, password, name, lastName } = userData;
  validateUserCreate(userData);
  
  const user = new User(name, lastName, email, password);
  return await saveUser(user);
};

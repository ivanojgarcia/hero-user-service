import { User } from '@user/model/UserModel';
import { validateUserCreate } from '@user/utils/validation';
import { UserRecord, UserRequest } from '@user/interface/user.interfaces';
import { UserService } from '@user/service/UserService';

const userService = new UserService();

export const createUser = async (userData: UserRequest): Promise<UserRecord> => {
  const { email, password, name, lastName } = userData;
  validateUserCreate(userData);
  const user = new User(name, lastName, email, password);
  const userCreated = await userService.saveUser(user);
  delete userCreated.password
  return userCreated;
};

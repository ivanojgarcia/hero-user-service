import { UserRecord } from '@user/interface/user.interfaces';
import { UserService } from '@user/service/UserService';
import { validateGetuser } from '@user/utils/validation';
const userService = new UserService();

export const getUserById = async (id: string): Promise<UserRecord> => {
  validateGetuser(id);
  const user = await userService.getUser(id)
  return user;
};

import { UserRecord } from '@user/interface/user.interfaces';
import { getUser } from '@user/service/UserService';
import { validateGetuser } from '@user/utils/validation';

export const getUserById = async (id: string): Promise<UserRecord> => {
  validateGetuser(id);
  const user = await getUser(id)
  return user;
};

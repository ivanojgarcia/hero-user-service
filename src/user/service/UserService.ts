import { Dynamo } from '@libs/ddbDynamo';
import { User } from '@user/model/UserModel';
import { NotFoundError, ValidationError } from '@libs/errors';
import { UserRecord } from '@user/interface/user.interfaces';
import { AttributeRemover } from '@libs/dataMapper';
import { hashPassword } from '@user/utils/password';

const { USER_TABLE } = process.env;
const attributeRemover = new AttributeRemover();
const dynamo = new Dynamo(USER_TABLE as string);

export const saveUser = async (user: User): Promise<UserRecord> => {
   
    if(await userExists(user.email)) throw new ValidationError("User already exists...");

    const passwordHashed = await hashPassword(user.password);
    const userToInsert = {
        ...user,
        password: passwordHashed,
    }

    await dynamo.write(userToInsert);
    return attributeRemover.removeAttributes(user, ['password']) as UserRecord;
}

export const getUser = async (id: string): Promise<UserRecord> => {
    const user: User = <User>await dynamo.get(id);

    if (!user) throw new NotFoundError("User not found...");
    return attributeRemover.removeAttributes(user, ['password']) as UserRecord;
}


export const userExists = async (email: string): Promise<boolean> => {
    const isCreated = await dynamo.query({
        index: "email_index",
        pkKey: 'email',
        pkValue: email,
    });
    return isCreated.Count !== 0;
}
import { Dynamo } from '@libs/ddbDynamo';
import { User } from '@user/model/UserModel';
import { NotFoundError, ValidationError } from '@libs/errors';
import { UserRecord } from '@user/interface/user.interfaces';
import { AttributeRemover } from '@libs/dataMapper';

const { USER_TABLE } = process.env;
const attributeRemover = new AttributeRemover();
const dynamo = new Dynamo(USER_TABLE as string);

export const saveUser = async (user: User): Promise<UserRecord> => {
    try {
        const isCreated = await dynamo.query({
            index: "email_index",
            pkKey: 'email',
            pkValue: user.email,
        });
        
        if(isCreated.Count !== 0) throw new ValidationError("Email already exists.")
        await dynamo.write(user);
        return attributeRemover.removeAttributes(user, ['password']) as UserRecord;
    } catch (error) {
        throw error;
    }
}

export const getUser = async (id: string): Promise<UserRecord> => {
    try {
        const user: User = <User>await dynamo.get(id);

        if (!user) throw new NotFoundError("User not found...");
        return attributeRemover.removeAttributes(user, ['password']) as UserRecord;
    } catch (error) {
        throw error
    }
}

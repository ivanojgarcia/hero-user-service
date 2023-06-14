import { Dynamo } from '@libs/ddbDynamo';
import { User } from '@user/model/UserModel';
import { NotFoundError, ValidationError } from '@libs/errors';
import { LoginRequest, LoginResponse, UserRecord } from '@user/interface/user.interfaces';

import { PasswordService } from '@user/utils/PasswordService';
import { UserTokenService } from '@user/service/UserTokenService';

const passwordService = new PasswordService();

const { USER_TABLE } = process.env;

export class UserService {
    readonly dynamo: Dynamo;

    constructor() {
        this.dynamo = new Dynamo(USER_TABLE as string);
    }

    async saveUser(user: User): Promise<UserRecord> {
        const userData = await this.userByEmail(user.email);
        if(userData) throw new ValidationError("User already exists...");

        const passwordHashed = await passwordService.hashPassword(user.password);
        const userToInsert = {
            ...user,
            password: passwordHashed,
        }

        await this.dynamo.write(userToInsert);

        return this.userResponse(userToInsert);
    }

    async getUser(id: string): Promise<UserRecord> {
        const user: User = <User>await this.dynamo.get(id);

        if (!user) throw new NotFoundError("User not found...");
        const userResponse = this.userResponse(user);
        delete userResponse.password;
        return userResponse;
    }

    async userByEmail(email: string): Promise<UserRecord | undefined> {
        const user  = await this.dynamo.getOne({
            index: "email_index",
            pkKey: 'email',
            pkValue: email,
        });

        return user as UserRecord | undefined;
    }

    private userResponse(userData: UserRecord): UserRecord {
        return {
            id: userData.id,
            name: userData.name,
            lastName: userData.lastName,
            password: userData.password,
            email: userData.email,
            createdAt: userData.createdAt,
        }
    }

    async userLogin(userLoginPayload: LoginRequest): Promise<LoginResponse> {
        const userTokenService = new UserTokenService();
        return userTokenService.authToken(userLoginPayload)
    }
}
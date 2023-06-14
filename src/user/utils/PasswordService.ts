import { InternalServerError } from '@libs/errors';
import { AuthData } from '@user/enum/user.enum';
import * as bcrypt from "bcryptjs";


export class PasswordService {
    readonly saltRounds: number;
    constructor() {
        this.saltRounds = AuthData.SALT_ROUNDS;
    }

    async hashPassword(password: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            return await bcrypt.hash(password, salt);
        } catch (error) {
            throw new InternalServerError(error.message);
        }
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            throw new InternalServerError(error.message);
        }
    }
}

// export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
//     try {
//         return await bcrypt.compare(password, hash);

//     } catch (error) {
//         throw new InternalServerError(error.message);
//     }
// }
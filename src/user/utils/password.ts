import { InternalServerError } from '@libs/errors';
import * as bcrypt from "bcryptjs";
const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
    try {
        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        return bcrypt.hashSync(password, salt);
    } catch (error) { 
        throw new InternalServerError(error.message);
    }
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(password, hash);

    } catch (error) {
        throw new InternalServerError(error.message);
    }
}
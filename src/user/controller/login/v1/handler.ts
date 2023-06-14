import { LoginRequest, LoginResponse } from "@user/interface/user.interfaces";
import { UserService } from "@user/service/UserService";
import { validateUserLogin } from "@user/utils/validation";

const userService = new UserService();

export const userLogin = async (userLoginRequest: LoginRequest): Promise<LoginResponse> => {
    validateUserLogin(userLoginRequest);
    return await userService.userLogin(userLoginRequest);
}

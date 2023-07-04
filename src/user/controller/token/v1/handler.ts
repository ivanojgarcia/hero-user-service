import { LoginResponse, RefreshTokenRequest } from "@user/interface/user.interfaces";
import { UserTokenService } from "@user/service/UserTokenService";
import { validateRefreshToken } from "@user/utils/validation";

const userTokenService = new UserTokenService();

export const generateRefreshToken = async (refreshToken: RefreshTokenRequest): Promise<LoginResponse> => {
    validateRefreshToken(refreshToken);
    return await userTokenService.getRefreshToken(refreshToken);
}

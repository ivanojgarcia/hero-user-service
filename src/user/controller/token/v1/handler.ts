import { LoginResponse, RefreshTokenRequest } from "@user/interface/user.interfaces";
import { UserTokenService } from "@user/service/UserTokenService";
import { validateRefreshToken } from "@user/utils/validation";

const userTokenService = new UserTokenService();

export const generateRefreshToken = async (refreshToken: RefreshTokenRequest): Promise<LoginResponse> => {
    validateRefreshToken(refreshToken);
    const authRefreshToken = await userTokenService.getRefreshToken(refreshToken);
    
    return {
        "token_type": "Bearer",
        "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYWJkNDllLWJjNDMtNDU2Yi1iMTc0LTMwMmJjYWZhZTBhNSIsImVtYWlsIjoiaXZhbm9qZ2FyY2lhQGdtYWlsLmNvbSIsImlhdCI6MTY4Njc0ODAyOCwiZXhwIjoxNjg2NzU1MjI3fQ.qYSdCmbgrDUrR0BE9-QjVN-Zi9rgQxEZSJoF3bOj99e6d-oO2RtC1UAfZvbT3q9JfiiAkXgRfaGy6JcZrp1NPipV3TkzD6Q-99YYostcmWwyBQ2agiVyq-Nkd-Qn_IY1pW6VlZwGJIkptuznbADu0hrRzo9YjN0cAlIcFxs-jZ307vR7G-4LeNVrK1T32gJLoPIY0aJxeibE8zri391y3vucZOhbxRZuMVZMpcbIONEdEYsoJAF1xrAuV-A0c6r38li3MN2NbmH5gF5NmyIkPbr8YVhCG6AFXpu9JIanOobB1l_tYjq0pDx5ViDKnewRYFTz-QlWUI-ngeWsdTZslA",
        "refresh_token": "72PlAVtx0U8WQfzXiFdgp",
        "expires_in": 7199
    }
}

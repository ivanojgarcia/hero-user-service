import { Dynamo } from '@libs/ddbDynamo';
import {
    SecretsManagerClient,
    GetSecretValueCommand,
  } from "@aws-sdk/client-secrets-manager";

import { UserToken  } from '@user/model/UserTokenModel';
import { LoginRequest, LoginResponse, RefreshTokenRequest, UserJWTData, UserRecord, RefreshTokenResponse} from '@user/interface/user.interfaces';

import * as jwt from 'jsonwebtoken';
import { AuthData } from '@user/enum/user.enum';
import { InternalServerError, ValidationError } from '@libs/errors';
import { PasswordService } from '@user/utils/PasswordService';
import { UserService } from '@user/service/UserService';

const passwordService = new PasswordService();

const { USER_TOKEN_TABLE, SECRET_NAME } = process.env;

const secretsClient = new SecretsManagerClient({
    region: "us-east-1",
  });


export class UserTokenService {
    readonly dynamo: Dynamo;

    constructor() {
        this.dynamo = new Dynamo(USER_TOKEN_TABLE as string);
    }

    private async saveUserToken(userToken: UserToken): Promise<UserToken> {
        await this.dynamo.write(userToken);
        return userToken;
    }

    async getUserToken(email: string): Promise<RefreshTokenResponse | undefined> {
        const userToken  = await this.dynamo.getOne({
            index: "email_index",
            pkKey: 'email',
            pkValue: email,
        });
        
        return userToken as RefreshTokenResponse | undefined;
    }

    async getRefreshToken(userRefreshToken: RefreshTokenRequest): Promise<RefreshTokenResponse | undefined>  {
        try {
            const {
                refresh_token: id,
                email
            } = userRefreshToken
            const refreshToken = <RefreshTokenResponse>await this.dynamo.get(id);
            if(!refreshToken) return undefined;

            if(refreshToken && refreshToken.email !== email) throw new ValidationError("Invalid token...")
            return refreshToken;
        } catch (error) {
            throw error;
        }


    }

    async getPrivateKey(): Promise<string | undefined> {
        
        let response;

        try {
        response = await secretsClient.send(
            new GetSecretValueCommand({
            SecretId: SECRET_NAME,
            VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
            })
        );
        } catch (error) {
            throw error;
        }
        return response.SecretString;
    }

    async refreshToken(user: UserJWTData): Promise<string> {

        const privateKey = await this.getPrivateKey();
        const jwtOptions = {
            algorithm: AuthData.ALGORITHM as string,
            expiresIn: AuthData.EXPIRES_IN_REFRESH,
        }
        const refreshToken: string = jwt.sign(user, privateKey, jwtOptions)
        const userTokenRequest = new UserToken(user.id, user.email, refreshToken, AuthData.EXPIRES_IN_REFRESH)
        const userToken = await this.saveUserToken(userTokenRequest)
        return userToken.id;
    }

    // private async validateToken(user: UserJWTData) {
    //     const refreshToken = await this.getUserToken();
    // }

    async authToken(userLoginPayload: LoginRequest): Promise<LoginResponse> {
        const userService = new UserService();
        const user = await userService.userByEmail(userLoginPayload.email);
        if(!user) throw new ValidationError("User or password invalid...");
        
        if (!await this.validPassword(userLoginPayload.password, user.password!)) {
            throw new ValidationError("User or password invalid...");
        }
        
        return this.accessToken(user);
    }

    private async validPassword(password: string, passwordHashed: string):  Promise<boolean> {
        return passwordService.comparePassword(password, passwordHashed);
    }


    async accessToken(user: UserRecord): Promise<LoginResponse> {
        delete user.password;
        const userJWTData: UserJWTData = {
            id: user.id,
            email: user.email,
        }
        const privateKey = await this.getPrivateKey();
        try {
            const jwtOptions = {
                algorithm: AuthData.ALGORITHM as string,
                expiresIn: AuthData.EXPIRES_IN as number,
            }
            
            const accessToken = jwt.sign(userJWTData, privateKey, jwtOptions);
            const validateRefreshTokenByEmail = await this.getUserToken(userJWTData.email);
            console.log("🚀 ~ file: UserTokenService.ts:152 ~ UserTokenService ~ accessToken ~ validateRefreshTokenByEmail:", validateRefreshTokenByEmail)
            
            if(validateRefreshTokenByEmail) {
                const items = {
                    refresToken: "newToken",
                }
                const key = {
                    id: validateRefreshTokenByEmail.id
                }
                await this.dynamo.update(key, items)
            }
            // const refreshToken = await this.refreshToken(userJWTData);
    
            return {
                token_type: AuthData.TOKEN_TYPE as string,
                access_token: accessToken,
                refresh_token: "refreshToken",
                expires_in: AuthData.EXPIRES_IN as number,
            };
        } catch (error) {
            throw error;
        }
    }

    
}
import { Dynamo } from '@libs/ddbDynamo';
import {
    SecretsManagerClient,
    GetSecretValueCommand,
  } from "@aws-sdk/client-secrets-manager";

import { UserToken  } from '@user/model/UserTokenModel';
import { 
    LoginRequest, 
    LoginResponse, 
    RefreshTokenRequest, 
    UserJWTData, 
    UserRecord,
    TokenDecoded,
    RefreshTokenResponse } from '@user/interface/user.interfaces';

import * as jwt from 'jsonwebtoken';
import { AuthData } from '@user/enum/user.enum';
import { UnauthorizedError, ValidationError } from '@libs/errors';
import { PasswordService } from '@user/utils/PasswordService';
import { UserService } from '@user/service/UserService';


const passwordService = new PasswordService();

const { USER_TOKEN_TABLE, SECRET_NAME, SECRET_PUBLIC_NAME } = process.env;

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

    async getRefreshToken(userRefreshToken: RefreshTokenRequest): Promise< LoginResponse>  {
        try {
            const {
                refresh_token: id,
                email
            } = userRefreshToken
            const refreshToken = <RefreshTokenResponse>await this.dynamo.get(id);
            await this.validateRefreshToken(refreshToken, email);
            const userService = new UserService();
            const user = <UserRecord>await userService.userByEmail(email)
            const newAccessToken = await this.generateAccessTokenByPrivateKey(user);
            return {
                token_type: AuthData.TOKEN_TYPE as string,
                access_token: newAccessToken,
                refresh_token: refreshToken.id,
                expires_in: AuthData.EXPIRES_IN as number,
            }

        } catch (error) {
            throw new ValidationError(error);
        }
    }

    private async validateRefreshToken(refreshTokenData: RefreshTokenResponse, email: string): Promise<void> {

        if(!refreshTokenData) throw new ValidationError("Refresh token invalid...");
        if(refreshTokenData && refreshTokenData.email !== email) throw new ValidationError("Refresh token invalid...");
        await this.validateTokenByPublicKey(refreshTokenData.refreshToken)
    }

    async validateTokenByPublicKey(token: string): Promise<TokenDecoded> { 
        try {
            const publicKey = await this.getPublicKey();
            const decoded = jwt.verify(token, publicKey, { algorithms: AuthData.ALGORITHM });
            return decoded;
        } catch (error) {
            throw error;
        }
    }

    private async getPrivateKey(): Promise<string | undefined> {
        
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

    private async getPublicKey(): Promise<string | undefined> {
        let response;
        try {
            response = await secretsClient.send(
                new GetSecretValueCommand({
                SecretId: SECRET_PUBLIC_NAME,
                VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
                })
            );
        } catch (error) {
            throw error;
        }
        return response.SecretString;
    }

    async refreshToken(user: UserJWTData): Promise<UserToken> {

        const privateKey = await this.getPrivateKey();
        const jwtOptions = {
            algorithm: AuthData.ALGORITHM as string,
            expiresIn: AuthData.EXPIRES_IN_REFRESH,
        }
        const refreshToken: string = jwt.sign(user, privateKey, jwtOptions)
        const userTokenRequest = new UserToken(user.id, user.email, refreshToken, AuthData.EXPIRES_IN_REFRESH)
        await this.saveUserToken(userTokenRequest)
        return userTokenRequest;
    }

    async authToken(userLoginPayload: LoginRequest): Promise<LoginResponse> {
        const userService = new UserService();
        const user = await userService.userByEmail(userLoginPayload.email);
        if(!user) throw new ValidationError("User or password invalid...");
        
        if (!await this.validPassword(userLoginPayload.password, user.password!)) {
            throw new ValidationError("User or password invalid...");
        }
        
        return this.accessToken(user);
    }

    private async generateAccessTokenByPrivateKey(userJWTData: UserJWTData): Promise<string> { 
        const privateKey = await this.getPrivateKey();
        const jwtOptions = {
            algorithm: AuthData.ALGORITHM as string,
            expiresIn: AuthData.EXPIRES_IN as number,
        }
        return jwt.sign(userJWTData, privateKey, jwtOptions);
    }

    private async validPassword(password: string, passwordHashed: string):  Promise<boolean> {
        return passwordService.comparePassword(password, passwordHashed);
    }

    private async generateRefreshToken(userJWTData: UserJWTData): Promise<UserToken> {
        const isRefreshToken = await this.refreshTokenExist(userJWTData.email);
        if(isRefreshToken) {
            this.deleteOldRefreshToken(isRefreshToken.id)
        }
        return await this.refreshToken(userJWTData);
    }

    private async deleteOldRefreshToken(refresTokenId: string): Promise<boolean> {
       const refreshTokenDeleted = await this.dynamo.delete(refresTokenId)
        return refreshTokenDeleted ? true : false;
    }

    private async refreshTokenExist(userEmail: string): Promise<RefreshTokenResponse | undefined> {
        return await this.getUserToken(userEmail);
    }

    async accessToken(user: UserRecord): Promise<LoginResponse> {
        delete user.password;
        const userJWTData: UserJWTData = {
            id: user.id,
            email: user.email,
        }
        const accessToken = await this.generateAccessTokenByPrivateKey(userJWTData);
        try {
            const refreshToken = await this.generateRefreshToken(userJWTData);
           
            return {
                token_type: AuthData.TOKEN_TYPE as string,
                access_token: accessToken,
                refresh_token: refreshToken.id,
                expires_in: AuthData.EXPIRES_IN as number,
            };
        } catch (error) {
            throw error;
        }
    }

    
}
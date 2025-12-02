import Api from "../api";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  RegisterResponse,
} from "./types";

class AuthClass extends Api {
  resource = "/os/auth";

  login = async (data: LoginCredentials): Promise<LoginResponse> => {
    const dataResp = await this.post(`${this.resource}/login`, data);
    console.log(dataResp, "dataRespdataResp");
    return dataResp;
  };
  register = async (data: RegisterCredentials): Promise<RegisterResponse> => {
    const dataResp = await this.post(`${this.resource}/signup`, data);
    return dataResp;
  };

  /* refreshToken = async (): Promise<LoginResponse> => {
    return await this.put(`${this.resource}/refresh-token`, )
    } */
}

const authApi = new AuthClass();
export default authApi;

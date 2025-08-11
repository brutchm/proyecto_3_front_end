import { ICrop } from "./crop.interface";

export interface ILoginResponse {
  accessToken: string;
  expiresIn: number
}

export interface IResponse<T> {
  data: T;
  message: string,
  meta: T;
}

export interface IUser {
  id?: number;
  name?: string;
  userFirstSurename?: string;
  userSecondSurename?: string;
  
  businessName?: string;
  businessMission?: string;
  businessVision?: string;
  businessId?: string;
  businessCountry?: string;
  businessStateProvince?: string;
  businessOtherDirections?: string;
  businessLocation?: string;
  userGender?: string;
  userPhoneNumber?: string;
  
  userEmail?: string;
  userPassword?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  authorities?: IAuthority[];
  role?: IRole
}

export interface IAuthority {
  authority: string;
}

export interface IFeedBackMessage {
  type?: IFeedbackStatus;
  message?: string;
}

export enum IFeedbackStatus {
  success = "SUCCESS",
  error = "ERROR",
  default = ''
}

export enum IRoleType {
  user = "ROLE_USER",
  admin = "ROLE_CORPORATION",
  superAdmin = 'ROLE_SUPER_ADMIN'
}

export interface IRole {
  createdAt: string;
  roleDescription: string;
  id: number;
  roleName : string;
  updatedAt: string;
}

export interface ISearch {
  page?: number;
  size?: number;
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?:number;
}
export interface IPriceMarket {
  id?: number;
  crop?: ICrop;
  price?: number;
  measureUnit?: string;
}
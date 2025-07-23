export interface ICorporation {
  id?: number;
  businessName?: string;
  businessMission?: string;
  businessVision?: string;
  businessId?: string;
  businessCountry?: string;
  businessStateProvince?: string;
  businessOtherDirections?: string;
  businessLocation?: string;
  name?: string;
  userFirstSurename?: string;
  userSecondSurename?: string;
  userGender?: string;
  userPhoneNumber?: string;
  userEmail?: string;
  userPassword?: string;
  role?: {
    id: number;
    roleName: string;
  };
  isActive?: boolean;
}

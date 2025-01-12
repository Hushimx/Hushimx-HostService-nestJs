import { Role } from "src/auth/role-permission-service/rolesData";

export type Admin = {
    id: number;
    name: string;
    email: string;
    role: Role;
    countryId: number;
  };
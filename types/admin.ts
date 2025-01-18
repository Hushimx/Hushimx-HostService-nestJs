import { Role } from "src/admin/auth/role-permission-service/rolesData";

export type Admin = {
    id: number;
    name: string;
    email: string;
    role: Role;
    countryId: number;
  };
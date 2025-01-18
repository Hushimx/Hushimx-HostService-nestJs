import { Role } from "src/admin/auth/role-permission-service/rolesData";
export interface GeneralFilterOptions {
  userRole: Role;
  userCountryId?: number; // RBAC for regional users
  dto: {
    [key: string]: any; // Allow additional dynamic fields
  };
  allowedFields?: string[]; // Fields allowed for filtering (e.g., 'name', 'email', etc.)
  enableCityFiltering?: boolean; // Toggle city filtering
}


export const buildFilters = ({
  userRole,
  userCountryId,
  dto,
  allowedFields = [],
  enableCityFiltering = true,
}: GeneralFilterOptions): any => {
  const filters: any = {};

  // General filtering for allowed fields (e.g., name, email)
  for (const field of allowedFields) {
    if (dto[field]) {
      filters[field] = { contains: dto[field], mode: 'insensitive' }; // Case-insensitive search
    }
  }

  // Apply RBAC for country filtering via city relation
  if (userRole === Role.SUPER_ADMIN) {
    if (dto.country) {
      filters.city = { countryId: dto.country }; // Filter by country through city relation
    }
  } else if (userRole === Role.REGIONAL_ADMIN) {
    filters.city = { countryId: userCountryId }; // Restrict to the user's country via city relation
  }

  // Conditionally apply RBAC for city filtering
  if (enableCityFiltering && dto.city) {
    filters.city = { ...filters.city, id: dto.city }; // Ensure city matches the provided city ID
  }

  return filters;
};

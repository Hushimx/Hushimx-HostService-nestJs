export function buildFilters(
    filters: { [key: string]: any },
    allowedFields: string[] = [],
    relationMappings: { [key: string]: string } = {}
  ) {
    const validatedFilters: Record<string, any> = {};
  
    for (const key in filters) {
      if (allowedFields.includes(key)) {
        const relationField = relationMappings[key];
        if (relationField) {
          validatedFilters[relationField] = { contains: filters[key], mode: 'insensitive' };
        } else {
          validatedFilters[key] =
            typeof filters[key] === 'string'
              ? { contains: filters[key], mode: 'insensitive' }
              : { equals: filters[key] };
        }
      }
    }
  
    return validatedFilters;
  }
  
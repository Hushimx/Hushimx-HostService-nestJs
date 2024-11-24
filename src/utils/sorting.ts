export function buildSorting(
    sortField: string | undefined,
    sortOrder: 'asc' | 'desc' | undefined,
    allowedFields: string[] = []
  ) {
    if (sortField && allowedFields.includes(sortField)) {
      return { [sortField]: sortOrder || 'asc' };
    }
    return undefined; // No sorting applied
  }
  
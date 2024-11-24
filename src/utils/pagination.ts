export function buildPagination(limit: number, offset: number): { skip: number; take: number } {
  // Ensure limit is between 1 and 100
  const validLimit = Math.min(Math.max(limit, 1), 100);

  // Ensure offset is 1 or greater (offset = 1 means the first page)
  const validOffset = Math.max(offset, 1);

  return {
    skip: (validOffset - 1) * validLimit,
    take: validLimit,
  };
}
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export interface PaginateAndSortOptions {
  page?: number;         // Current page number (1-based)
  limit?: number;        // Number of items per page
  sortField?: string;    // Field to sort by
  sortOrder?: 'asc' | 'desc'; // Sorting order
}

export const paginateAndSort = async <T>(
  model: any, // Prisma model (e.g., `prisma.room`)
  args: any = {}, // Query arguments (e.g., `where`, `include`)
  options: PaginateAndSortOptions = {}, // Pagination and sorting options
  allowedSortFields: string[] = [], // List of allowed fields for sorting
): Promise<PaginatedResult<T>> => {
  // Default pagination values
  const page = Math.max(options.page || 1, 1); // Ensure page is at least 1
  const limit = Math.max(options.limit || 10, 1); // Ensure limit is at least 1
  const skip = (page - 1) * limit;

  // Sorting logic
  const sortField = options.sortField && allowedSortFields.includes(options.sortField)
    ? options.sortField
    : 'createdAt'; // Default sort field
  const sortOrder = options.sortOrder === 'desc' ? 'desc' : 'asc';

  // Fetch data and total count
  const [total, data] = await Promise.all([
    model.count({ where: args.where }), // Count total items
    model.findMany({
      relationLoadStrategy: 'join',
      ...args,
      take: limit,
      skip,
      orderBy: { [sortField]: sortOrder },
    }),
  ]);

  // Calculate pagination metadata
  const lastPage = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      lastPage,
      currentPage: page,
      perPage: limit,
      prev: page > 1 ? page - 1 : null,
      next: page < lastPage ? page + 1 : null,
    },
  };
};

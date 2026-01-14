/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: any[];
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T> {
    pagination: PaginationMeta;
}

/**
 * Creates a success response
 */
export const successResponse = <T = any>(message: string, data?: T): ApiResponse<T> => {
    return {
        success: true,
        message,
        data
    };
};

/**
 * Creates an error response
 */
export const errorResponse = (message: string, errors?: any[]): ApiResponse => {
    return {
        success: false,
        message,
        errors
    };
};

/**
 * Creates pagination metadata
 */
export const createPaginationMeta = (
    page: number,
    limit: number,
    total: number
): PaginationMeta => {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

/**
 * Creates a paginated response
 */
export const paginatedResponse = <T = any>(
    message: string,
    data: T,
    page: number,
    limit: number,
    total: number
): PaginatedResponse<T> => {
    return {
        success: true,
        message,
        data,
        pagination: createPaginationMeta(page, limit, total)
    };
};

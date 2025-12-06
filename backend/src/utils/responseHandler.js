export const successResponse = (res, statusCode, message, data = null) => {
    const response = { success: true, message };
    if (data) response.result = data; // only add result if provided
    return res.status(statusCode).json(response);
};

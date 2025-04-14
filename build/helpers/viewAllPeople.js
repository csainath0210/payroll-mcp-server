import { payrollApiClient } from "../api.js";
import { PAYROLL_PEOPLE_ENDPOINT } from "../constants.js";
/**
 * Fetches all people information from the payroll API with filtering and pagination
 * @param credentials Either API credentials (authId + authKey) or partner credentials (partnerKey + clientKey)
 * @param params Optional parameters for filtering and pagination
 * @returns Promise with people information
 */
export const viewAllPeople = async (credentials, params = {}) => {
    // Validate that we have either API credentials or partner credentials
    if (!isValidCredentials(credentials)) {
        throw new Error("Either API credentials (authId + authKey) or partner credentials (partnerKey + clientKey) are required");
    }
    const headers = createHeaders(credentials);
    const queryParams = new URLSearchParams({
        pageNumber: (params.pageNumber || 1).toString(),
        pageSize: (params.pageSize || 20).toString()
    });
    // Add optional filter parameters
    if (params.name)
        queryParams.append("name", params.name);
    if (params.email)
        queryParams.append("email", params.email);
    if (params.type)
        queryParams.append("type", params.type);
    if (params.userRole)
        queryParams.append("userRole", params.userRole);
    if (params.created_from)
        queryParams.append("created_from", params.created_from);
    if (params.created_before)
        queryParams.append("created_before", params.created_before);
    const response = await payrollApiClient.get(`${PAYROLL_PEOPLE_ENDPOINT}?${queryParams.toString()}`, { headers });
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
};
// Type guard to check if credentials are API credentials
function isApiCredentials(credentials) {
    return 'authId' in credentials && 'authKey' in credentials;
}
// Helper to validate credentials
function isValidCredentials(credentials) {
    if (isApiCredentials(credentials)) {
        return !!credentials.authId && !!credentials.authKey;
    }
    else {
        return !!credentials.partnerKey && !!credentials.clientKey;
    }
}
// Helper to create headers based on credential type
function createHeaders(credentials) {
    if (isApiCredentials(credentials)) {
        return {
            "x-api-id": credentials.authId.toString(),
            "x-api-key": credentials.authKey
        };
    }
    else {
        return {
            "x-partner-key": credentials.partnerKey,
            "x-client-key": credentials.clientKey
        };
    }
}
//# sourceMappingURL=viewAllPeople.js.map
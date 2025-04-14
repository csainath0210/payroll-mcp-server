import { payrollApiClient } from "../api.js";
/**
 * Fetches employee information from the payroll API
 * @param employeeId The ID of the employee to fetch
 * @param authId The authentication ID
 * @param authKey The authentication key
 * @returns Promise with employee information
 */
export const viewPeople = async (employeeId, authId, authKey) => {
    if (!employeeId) {
        throw new Error("Employee ID is required");
    }
    if (!authId || !authKey) {
        throw new Error("Authentication credentials are required");
    }
    const request = {
        auth: {
            id: authId,
            key: authKey,
        },
        request: {
            type: "people",
            "sub-type": "view",
        },
        data: {
            "employee-id": employeeId,
        },
    };
    console.log("This is a log message that won't break the protocol.");
    const response = await payrollApiClient.post("/api/people", request);
    if (response.error) {
        throw new Error(response.error);
    }
    return response.data;
};
//# sourceMappingURL=viewPeople.js.map
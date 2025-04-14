import { payrollApiClient } from "../api.js";

interface ViewPeopleRequest {
  auth: {
    id: number;
    key: string;
  };
  request: {
    type: "people";
    "sub-type": "view";
  };
  data: {
    "employee-id": number;
  };
}

interface ViewPeopleResponse {
  name: string;
  email: string;
  title: string | null;
  department: string | null;
  "manager-employee-id": number | null;
  pan: string | null;
  "bank-ifsc": string | null;
  "bank-account-number": string | null;
}

/**
 * Fetches employee information from the payroll API
 * @param employeeId The ID of the employee to fetch
 * @param authId The authentication ID
 * @param authKey The authentication key
 * @returns Promise with employee information
 */
export const viewPeople = async (
  employeeId: number,
  authId: number,
  authKey: string
): Promise<ViewPeopleResponse> => {
  if (!employeeId) {
    throw new Error("Employee ID is required");
  }

  if (!authId || !authKey) {
    throw new Error("Authentication credentials are required");
  }

  const request: ViewPeopleRequest = {
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

  const response = await payrollApiClient.post<ViewPeopleResponse>(
    "/api/people",
    request
  );

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
}; 
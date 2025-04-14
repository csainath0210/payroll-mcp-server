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
export declare const viewPeople: (employeeId: number, authId: number, authKey: string) => Promise<ViewPeopleResponse>;
export {};

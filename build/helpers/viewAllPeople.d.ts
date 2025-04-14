interface OptionalUserData {
    personal_phone_number: string | null;
    personal_email_address: string | null;
    father_name: string | null;
    father_dob: string | null;
    mother_name: string | null;
    mother_dob: string | null;
    spouse_name: string | null;
    spouse_dob: string | null;
    child_1_name: string | null;
    child_2_name: string | null;
    permanent_address: string | null;
    temporary_address: string | null;
    highest_qualification: string | null;
    aadhaar_number: string | null;
    marital_status: string | null;
    work_experience: string | null;
    previous_employer: string | null;
    previous_designation: string | null;
    marriage_anniversary: string | null;
    emergency_contact_name: string | null;
    emergency_contact_number: string | null;
    emergency_contact_relation: string | null;
    blood_group: string | null;
    nationality: string | null;
    custom_1: string | null;
    custom_2: string | null;
    custom_3: string | null;
    custom_4: string | null;
    custom_5: string | null;
}
interface Person {
    id: number;
    name: string;
    type: string;
    email: string;
    employee_id: string;
    hire_date: string | null;
    pan: string | null;
    uan: string | null;
    date_of_birth: string | null;
    phone_number: string | null;
    job_title: string | null;
    department: string | null;
    bank_ifsc: string | null;
    bank_account_number: string | null;
    manager_id: number | null;
    manager_employee_id: string | null;
    is_pt_enabled: boolean | null;
    is_pf_enabled: boolean | null;
    state: string | null;
    stop_salary: boolean;
    is_active: boolean;
    optional_user_data: OptionalUserData;
    created_at: number;
    updated_at: number;
}
interface ViewAllPeopleResponse {
    page_count: number;
    page_number: number;
    page_size: number;
    people: Person[];
}
interface ViewAllPeopleParams {
    pageNumber?: number;
    pageSize?: number;
    name?: string;
    email?: string;
    type?: string;
    userRole?: string;
    created_from?: string;
    created_before?: string;
}
export interface ApiCredentials {
    authId: number;
    authKey: string;
}
export interface PartnerCredentials {
    partnerKey: string;
    clientKey: string;
}
/**
 * Fetches all people information from the payroll API with filtering and pagination
 * @param credentials Either API credentials (authId + authKey) or partner credentials (partnerKey + clientKey)
 * @param params Optional parameters for filtering and pagination
 * @returns Promise with people information
 */
export declare const viewAllPeople: (credentials: ApiCredentials | PartnerCredentials, params?: ViewAllPeopleParams) => Promise<ViewAllPeopleResponse>;
export {};

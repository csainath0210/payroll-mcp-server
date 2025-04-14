import { z } from "zod";
import { server } from "./server.js";
import { viewPeople } from "../helpers/viewPeople.js";
import { viewAllPeople } from "../helpers/viewAllPeople.js";
// View People tool
server.tool("view-people", "View information about a specific person", {
    employeeId: z.number().describe("The ID of the employee to fetch"),
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
}, async ({ employeeId, authId, authKey }) => {
    try {
        const person = await viewPeople(employeeId, authId, authKey);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(person)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: "Failed to fetch person information"
                }],
            isError: true
        };
    }
});
// View All People tool
server.tool("view-all-people", "View all people with optional filtering and pagination", {
    // API Credentials (Optional)
    authId: z.number().optional().describe("The API ID (required if using API authentication)"),
    authKey: z.string().optional().describe("The API key (required if using API authentication)"),
    // Partner Credentials (Optional)
    partnerKey: z.string().optional().describe("The partner key (required if using partner authentication)"),
    clientKey: z.string().optional().describe("The client key (required if using partner authentication)"),
    // Pagination and Filters
    pageNumber: z.number().optional().describe("Page number for pagination"),
    pageSize: z.number().optional().describe("Number of items per page"),
    name: z.string().optional().describe("Filter by name"),
    email: z.string().optional().describe("Filter by email"),
    type: z.string().optional().describe("Filter by type (e.g., employee, contractor)"),
    userRole: z.string().optional().describe("Filter by user role"),
    created_from: z.string().optional().describe("Filter by creation date (from)"),
    created_before: z.string().optional().describe("Filter by creation date (before)")
}, async ({ authId, authKey, partnerKey, clientKey, ...params }) => {
    try {
        // Validate and prepare credentials
        let credentials;
        if (authId && authKey) {
            credentials = { authId, authKey };
        }
        else if (partnerKey && clientKey) {
            credentials = { partnerKey, clientKey };
        }
        else {
            throw new Error("Either API credentials (authId + authKey) or partner credentials (partnerKey + clientKey) must be provided");
        }
        const people = await viewAllPeople(credentials, params);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(people)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: "Failed to fetch people list"
                }],
            isError: true
        };
    }
});
// Example tool that gets employee information
server.tool("getEmployeeInfo", "Get information about an employee", {
    employeeId: z.number().describe("The ID of the employee to fetch"),
}, async (employeeId) => {
    try {
        // Here you would typically call your actual API or database
        const employee = {
            id: employeeId,
            name: "John Doe",
            department: "Engineering",
            role: "Software Engineer",
        };
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(employee)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: "Failed to fetch employee information"
                }],
            isError: true
        };
    }
});
// Example tool that calculates payroll
server.tool("calculatePayroll", "Calculate payroll for an employee", {
    employeeId: z.number().describe("The ID of the employee"),
    hoursWorked: z.number().describe("Number of hours worked"),
    hourlyRate: z.number().describe("Hourly rate of the employee"),
}, async (args) => {
    try {
        const grossPay = args.hoursWorked * args.hourlyRate;
        const tax = grossPay * 0.2; // 20% tax
        const netPay = grossPay - tax;
        const result = {
            employeeId: args.employeeId,
            grossPay,
            tax,
            netPay,
        };
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify(result)
                }]
        };
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: "Failed to calculate payroll"
                }],
            isError: true
        };
    }
});

// Get Run Payroll tool
server.tool("get-run-payroll", "Get payroll information with filtering and pagination", {
    payroll_month: z.string().describe("Payroll month in YYYY-MM-DD format"),
    search_phrase: z.string().optional().describe("Search phrase to filter results"),
    departments: z.array(z.string()).optional().describe("Filter by departments"),
    locations: z.array(z.string()).optional().describe("Filter by locations"),
    page: z.number().optional().describe("Page number for pagination"),
    limit: z.number().optional().refine(val => !val || val <= 100, {
        message: "Limit must be less than or equal to 100"
    }).describe("Number of items per page (max 100)"),
    order: z.object({
        ORDER_BY_NAME: z.enum(["asc", "desc"]).optional(),
        ORDER_BY_CANCELLED: z.enum(["asc", "desc"]).optional()
    }).optional().describe("Sorting order"),
    status_filter: z.enum([
        "finalized",
        "paid",
        "skipped",
        "net-pay-on-hold",
        "gross-pay-on-hold"
    ]).optional().describe("Filter by status")
}, async (args) => {
    try {
        const response = await fetch("http://app.localopfin.com/v2/api/get-run-payroll", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: [{
                type: "text",
                text: JSON.stringify(data)
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: "Failed to fetch payroll information"
            }],
            isError: true
        };
    }
});

// Finalize Payroll tool
server.tool("finalize-payroll", "Finalize payroll for a specific month", {
    payroll_month: z.string().describe("Payroll month in YYYY-MM-DD format")
}, async (args) => {
    try {
        const response = await fetch("http://app.localopfin.com/v2/api/run-payroll/finalize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: [{
                type: "text",
                text: JSON.stringify(data)
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: "Failed to finalize payroll"
            }],
            isError: true
        };
    }
});

// Unfinalize Payroll tool
server.tool("unfinalize-payroll", "Unfinalize payroll for a specific month", {
    payroll_month: z.string().describe("Payroll month in YYYY-MM-DD format")
}, async (args) => {
    try {
        const response = await fetch("http://app.localopfin.com/v2/api/run-payroll/unfinalize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(args)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return {
            content: [{
                type: "text",
                text: JSON.stringify(data)
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: "Failed to unfinalize payroll"
            }],
            isError: true
        };
    }
});

//# sourceMappingURL=tools.js.map
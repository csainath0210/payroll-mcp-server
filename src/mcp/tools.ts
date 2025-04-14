import { z } from "zod";
import { server } from "./server.js";
import { viewPeople } from "../helpers/viewPeople.js";
import { viewAllPeople, ApiCredentials, PartnerCredentials } from "../helpers/viewAllPeople.js";

// View People tool
server.tool(
  "view-people",
  "View information about a specific person",
  {
    employeeId: z.number().describe("The ID of the employee to fetch"),
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
  },
  async ({ employeeId, authId, authKey }) => {
    try {
      const person = await viewPeople(employeeId, authId, authKey);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(person)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: "Failed to fetch person information"
        }],
        isError: true
      };
    }
  }
);

// View All People tool
server.tool(
  "view-all-people",
  "View all people with optional filtering and pagination",
  {
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
  },
  async ({ authId, authKey, partnerKey, clientKey, ...params }) => {
    try {
      // Validate and prepare credentials
      let credentials: ApiCredentials | PartnerCredentials;
      
      if (authId && authKey) {
        credentials = { authId, authKey };
      } else if (partnerKey && clientKey) {
        credentials = { partnerKey, clientKey };
      } else {
        throw new Error("Either API credentials (authId + authKey) or partner credentials (partnerKey + clientKey) must be provided");
      }

      const people = await viewAllPeople(credentials, params);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(people)
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: "Failed to fetch people list"
        }],
        isError: true
      };
    }
  }
);

// Example tool that gets employee information
server.tool(
  "getEmployeeInfo",
  "Get information about an employee",
  {
    employeeId: z.number().describe("The ID of the employee to fetch"),
  },
  async (employeeId) => {
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
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: "Failed to fetch employee information"
        }],
        isError: true
      };
    }
  }
);

// Example tool that calculates payroll
server.tool(
  "calculatePayroll",
  "Calculate payroll for an employee",
  {
    employeeId: z.number().describe("The ID of the employee"),
    hoursWorked: z.number().describe("Number of hours worked"),
    hourlyRate: z.number().describe("Hourly rate of the employee"),
  },
  async (args) => {
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
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: "Failed to calculate payroll"
        }],
        isError: true
      };
    }
  }
);

// Get Run Payroll tool
server.tool(
  "get-run-payroll",
  "Get payroll information with filtering and pagination",
  {
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
  },
  async (args) => {
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
  }
);

// Finalize Payroll tool
server.tool(
  "finalize-payroll",
  "Finalize payroll for a specific month",
  {
    payroll_month: z.string().describe("Payroll month in YYYY-MM-DD format")
  },
  async (args) => {
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
  }
);

// Unfinalize Payroll tool
server.tool(
  "unfinalize-payroll",
  "Unfinalize payroll for a specific month",
  {
    payroll_month: z.string().describe("Payroll month in YYYY-MM-DD format")
  },
  async (args) => {
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
  }
);

// Execute Payroll tool
server.tool(
  "execute-payroll",
  "Execute payroll for a specific month with options for dry run and skipped payrolls",
  {
    // Required fields
    payroll_month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Payroll month in YYYY-MM-DD format"),
    
    // Optional fields
    is_dry_run: z.boolean().optional().describe("Whether to perform a dry run (requires super admin privileges)"),
    is_consent_granted_for_skipped_payrolls: z.boolean().optional().describe("Whether consent is granted for processing skipped payrolls")
  },
  async ({ payroll_month, is_dry_run = false, is_consent_granted_for_skipped_payrolls = false }) => {
    try {
      const response = await fetch("http://app.localopfin.com/v2/api/run-payroll/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          payroll_month,
          is_dry_run,
          is_consent_granted_for_skipped_payrolls
        })
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Unauthorized: Dry run is only allowed for super admins");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)  // Pretty print the response
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Failed to execute payroll: ${error.message}`
        }],
        isError: true
      };
    }
  }
);

// Create People tool
server.tool(
  "create-people",
  "Create a new employee or contractor in RazorpayX Payroll",
  {
    email: z.string().email().describe("Email address of the person"),
    name: z.string().describe("Full name of the person"),
    type: z.enum(["employee", "contractor"]).describe("Type of person to create")
  },
  async ({ email, name, type }) => {
    try {
      const response = await fetch("http://app.localopfin.com/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: process.env.OPFIN_AUTH_ID,
            key: process.env.OPFIN_AUTH_KEY
          },
          request: {
            type: "people",
            "sub-type": "create"
          },
          data: {
            email,
            name,
            type
          }
        })
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
          text: "Failed to create person"
        }],
        isError: true
      };
    }
  }
);

// Edit People tool
server.tool(
  "edit-people",
  "Edit details of an employee or contractor in RazorpayX Payroll",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields
    email: z.string().email().describe("Email address of the person to edit"),
    
    // Optional fields
    managerEmployeeId: z.number().optional().describe("Employee ID of the manager"),
    title: z.string().optional().describe("Job title"),
    department: z.string().optional().describe("Department name"),
    bankIfsc: z.string().optional().describe("Bank IFSC code"),
    bankAccountNumber: z.string().optional().describe("Bank account number"),
    pan: z.string().optional().describe("PAN number"),
    phoneNumber: z.string().optional().describe("Phone number"),
    employeeId: z.number().optional().describe("Employee ID"),
    ptEnabled: z.boolean().optional().describe("Whether PT is enabled"),
    hiringDate: z.string().optional().describe("Hiring date in YYYY-MM-DD format"),
    state: z.string().optional().describe("State of employment"),
    pastSalary: z.number().optional().describe("Past salary amount"),
    pastExemption: z.number().optional().describe("Past exemption amount"),
    pastTds: z.number().optional().describe("Past TDS amount"),
    previousEmployerSalary: z.number().optional().describe("Previous employer salary"),
    previousEmployerTds: z.number().optional().describe("Previous employer TDS")
  },
  async ({ authId, authKey, email, managerEmployeeId, title, department, bankIfsc, 
          bankAccountNumber, pan, phoneNumber, employeeId, ptEnabled, hiringDate,
          state, pastSalary, pastExemption, pastTds, previousEmployerSalary, previousEmployerTds }) => {
    try {
      const response = await fetch("http://app.localopfin.com/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "people",
            "sub-type": "edit"
          },
          data: {
            email,
            ...(managerEmployeeId && { "manager-employee-id": managerEmployeeId }),
            ...(title && { title }),
            ...(department && { department }),
            ...(bankIfsc && { "bank-ifsc": bankIfsc }),
            ...(bankAccountNumber && { "bank-account-number": bankAccountNumber }),
            ...(pan && { pan }),
            ...(phoneNumber && { "phone-number": phoneNumber }),
            ...(employeeId && { "employee-id": employeeId }),
            ...(ptEnabled !== undefined && { "pt-enabled": ptEnabled }),
            ...(hiringDate && { "hiring-date": hiringDate }),
            ...(state && { state }),
            ...(pastSalary !== undefined && { pastSalary }),
            ...(pastExemption !== undefined && { pastExemption }),
            ...(pastTds !== undefined && { pastTds }),
            ...(previousEmployerSalary !== undefined && { previousEmployerSalary }),
            ...(previousEmployerTds !== undefined && { previousEmployerTds })
          }
        })
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
          text: "Failed to edit person details"
        }],
        isError: true
      };
    }
  }
);

// Set Salary tool
server.tool(
  "set-salary",
  "Set the annual salary structure for an employee",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields
    employeeId: z.number().describe("The ID of the employee"),
    customSalaryStructure: z.boolean().describe("Whether using a custom salary structure"),
    salaryStructure: z.object({
      basic: z.number().describe("Basic salary component"),
      da: z.number().describe("Dearness Allowance"),
      hra: z.number().describe("House Rent Allowance"),
      specialAllowance: z.number().describe("Special Allowance"),
      lta: z.number().describe("Leave Travel Allowance"),
      employerPf: z.number().describe("Employer PF contribution"),
      employerEsi: z.number().describe("Employer ESI contribution"),
      customAllowances: z.array(z.object({
        name: z.string().describe("Name of the custom allowance"),
        amount: z.number().describe("Amount of the allowance"),
        taxable: z.enum(["yes", "no", "flexi"]).describe("Taxability of the allowance")
      })).optional().describe("List of custom allowances"),
      deductions: z.array(z.object({
        name: z.string().describe("Name of the deduction"),
        amount: z.number().describe("Amount to deduct"),
        taxable: z.boolean().describe("Whether the deduction is taxable")
      })).optional().describe("List of deductions")
    }).describe("Complete salary structure details")
  },
  async ({ authId, authKey, employeeId, customSalaryStructure, salaryStructure }) => {
    try {
      const response = await fetch("http://app.localopfin.com/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "people",
            "sub-type": "set-salary"
          },
          data: {
            "employee-id": employeeId,
            "custom-salary-structure": customSalaryStructure,
            "salary-structure": {
              basic: salaryStructure.basic,
              da: salaryStructure.da,
              hra: salaryStructure.hra,
              "special-allowance": salaryStructure.specialAllowance,
              lta: salaryStructure.lta,
              "employer-pf": salaryStructure.employerPf,
              "employer-esi": salaryStructure.employerEsi,
              "custom-allowances": salaryStructure.customAllowances?.map(allowance => ({
                name: allowance.name,
                amount: allowance.amount,
                taxable: allowance.taxable
              })),
              deductions: salaryStructure.deductions?.map(deduction => ({
                name: deduction.name,
                amount: deduction.amount,
                taxable: deduction.taxable
              }))
            }
          }
        })
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
          text: "Failed to set employee salary"
        }],
        isError: true
      };
    }
  }
);

// Dismiss People tool
server.tool(
  "dismiss-people",
  "Dismiss an employee or contractor",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields
    email: z.string().email().describe("Email address of the person to dismiss"),
    dateOfDismissal: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in dd/mm/yyyy format").describe("Date of dismissal in dd/mm/yyyy format")
  },
  async ({ authId, authKey, email, dateOfDismissal }) => {
    try {
      const response = await fetch("http://app.localopfin.com/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "people",
            "sub-type": "dismiss"
          },
          data: {
            email,
            dateOfDismissal
          }
        })
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
          text: "Failed to dismiss person"
        }],
        isError: true
      };
    }
  }
);

// View Payroll tool
server.tool(
  "view-payroll",
  "View payroll information for an employee for a specific month",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields
    email: z.string().email().describe("Email address of the employee"),
    payrollMonth: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("Payroll month in YYYY-MM format")
  },
  async ({ authId, authKey, email, payrollMonth }) => {
    try {
      const response = await fetch("http://app.localopfin.com/api/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "payroll",
            "sub-type": "view-payroll"
          },
          data: {
            email,
            "payroll-month": payrollMonth
          }
        })
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
  }
);

// Add Payroll Additions tool
server.tool(
  "add-payroll-additions",
  "Add additions (bonuses, incentives, etc.) to an employee's payroll",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields
    email: z.string().email().describe("Email address of the employee"),
    payrollMonth: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("Payroll month in YYYY-MM format"),
    additions: z.array(z.object({
      label: z.string().describe("Label/name of the addition"),
      amount: z.number().describe("Amount to be added")
    })).describe("List of additions to apply")
  },
  async ({ authId, authKey, email, payrollMonth, additions }) => {
    try {
      const response = await fetch("http://app.localopfin.com/api/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "payroll",
            "sub-type": "add-additions"
          },
          data: {
            email,
            "payroll-month": payrollMonth,
            additions
          }
        })
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
          text: "Failed to add payroll additions"
        }],
        isError: true
      };
    }
  }
);

// Add Payroll Deductions tool
server.tool(
  "add-payroll-deductions",
  "Add deductions to an employee's payroll",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields
    email: z.string().email().describe("Email address of the employee"),
    payrollMonth: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("Payroll month in YYYY-MM format"),
    
    // Either deductionAmount or deductionDays must be provided
    deductionAmount: z.number().optional().describe("Fixed amount to deduct"),
    deductionDays: z.number().optional().describe("Number of days of pay to deduct (will be calculated based on monthly salary and days in month)")
  },
  async ({ authId, authKey, email, payrollMonth, deductionAmount, deductionDays }) => {
    try {
      // Ensure either deductionAmount or deductionDays is provided, but not both
      if ((deductionAmount === undefined && deductionDays === undefined) || 
          (deductionAmount !== undefined && deductionDays !== undefined)) {
        throw new Error("Either deductionAmount or deductionDays must be provided, but not both");
      }

      const response = await fetch("http://app.localopfin.com/api/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "payroll",
            "sub-type": "add-deduction"
          },
          data: {
            email,
            "payroll-month": payrollMonth,
            ...(deductionAmount !== undefined && { "deduction-amount": deductionAmount }),
            ...(deductionDays !== undefined && { "deduction-days": deductionDays })
          }
        })
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
          text: "Failed to add payroll deduction"
        }],
        isError: true
      };
    }
  }
);

// Pause/Resume Payroll tool
server.tool(
  "toggle-payroll",
  "Pause or resume an employee's payroll for a specific month",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields
    email: z.string().email().describe("Email address of the employee"),
    payrollMonth: z.string().regex(/^\d{4}-\d{2}$/, "Date must be in YYYY-MM format").describe("Payroll month in YYYY-MM format"),
    value: z.boolean().describe("true to pause payroll, false to resume")
  },
  async ({ authId, authKey, email, payrollMonth, value }) => {
    try {
      const response = await fetch("http://app.localopfin.com/api/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "payroll",
            "sub-type": "do-not-pay"
          },
          data: {
            email,
            "payroll-month": payrollMonth,
            value
          }
        })
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
          text: "Failed to toggle payroll status"
        }],
        isError: true
      };
    }
  }
);

// Modify Attendance tool
server.tool(
  "modify-attendance",
  "Add or modify employee attendance, including check-in/out times and leaves",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields - Either email or employeeId must be provided
    email: z.string().email().optional().describe("Email address of the employee"),
    employeeId: z.number().optional().describe("Employee ID"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Date of attendance"),
    status: z.enum([
      "present",
      "leave",
      "half-day",
      "unpaid-leave",
      "unpaid-half-day"
    ]).describe("Attendance status"),
    
    // Optional fields
    leaveType: z.number().optional().describe("Type of leave (if applicable). Use -1 to see available options"),
    checkin: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format").optional().describe("Check-in time (for present/half-day)"),
    checkout: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format").optional().describe("Check-out time (for present/half-day)"),
    remarks: z.string().optional().describe("Additional remarks or notes")
  },
  async ({ authId, authKey, email, employeeId, date, status, leaveType, checkin, checkout, remarks }) => {
    try {
      // Ensure either email or employeeId is provided
      if (!email && !employeeId) {
        throw new Error("Either email or employeeId must be provided");
      }

      // Validate checkin/checkout are only provided for present or half-day status
      if ((checkin || checkout) && !["present", "half-day"].includes(status)) {
        throw new Error("Check-in/out times are only applicable for present or half-day status");
      }

      const response = await fetch("http://app.localopfin.com/api/att", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "attendance",
            "sub-type": "modify"
          },
          data: {
            ...(email && { email }),
            ...(employeeId && { "employee-id": employeeId }),
            date,
            status,
            ...(leaveType !== undefined && { "leave-type": leaveType }),
            ...(checkin && { checkin }),
            ...(checkout && { checkout }),
            ...(remarks && { remarks })
          }
        })
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
          text: "Failed to modify attendance"
        }],
        isError: true
      };
    }
  }
);

// Fetch Attendance tool
server.tool(
  "fetch-attendance",
  "Get attendance records for an employee on a specific date",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields - Either email or employeeId must be provided
    email: z.string().email().optional().describe("Email address of the employee"),
    employeeId: z.number().optional().describe("Employee ID"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Date to fetch attendance for")
  },
  async ({ authId, authKey, email, employeeId, date }) => {
    try {
      // Ensure either email or employeeId is provided
      if (!email && !employeeId) {
        throw new Error("Either email or employeeId must be provided");
      }

      const response = await fetch("http://app.localopfin.com/api/att", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "attendance",
            "sub-type": "fetch"
          },
          data: {
            ...(email && { email }),
            ...(employeeId && { "employee-id": employeeId }),
            date
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)  // Pretty print the response
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: "Failed to fetch attendance records"
        }],
        isError: true
      };
    }
  }
);

// Edit Attendance tool
server.tool(
  "edit-attendance",
  "Edit an existing attendance record for an employee",
  {
    // Auth credentials (Required)
    authId: z.number().describe("The authentication ID"),
    authKey: z.string().describe("The authentication key"),
    
    // Required fields
    employeeId: z.number().describe("Employee ID"),
    employeeType: z.enum(["employee", "contractor"]).describe("Type of employee"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").describe("Date of attendance"),
    
    // Optional fields
    status: z.enum([
      "present",
      "leave",
      "half-day",
      "unpaid-leave",
      "unpaid-half-day"
    ]).optional().describe("Attendance status"),
    leaveType: z.number().optional().describe("Type of leave (if applicable). Use -1 to see available options"),
    checkin: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format").optional().describe("Check-in time (for present/half-day)"),
    checkout: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:mm format").optional().describe("Check-out time (for present/half-day)"),
    remarks: z.string().optional().describe("Additional remarks or notes")
  },
  async ({ authId, authKey, employeeId, employeeType, date, status, leaveType, checkin, checkout, remarks }) => {
    try {
      // Validate checkin/checkout are only provided for present or half-day status
      if ((checkin || checkout) && status && !["present", "half-day"].includes(status)) {
        throw new Error("Check-in/out times are only applicable for present or half-day status");
      }

      const response = await fetch("http://app.localopfin.com/api/att", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          auth: {
            id: authId,
            key: authKey
          },
          request: {
            type: "attendance",
            "sub-type": "modify"
          },
          data: {
            "employee-id": employeeId,
            "employee-type": employeeType,
            date,
            ...(status && { status }),
            ...(leaveType !== undefined && { "leave-type": leaveType }),
            ...(checkin && { checkin }),
            ...(checkout && { checkout }),
            ...(remarks && { remarks })
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(data, null, 2)  // Pretty print the response
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: "Failed to edit attendance record"
        }],
        isError: true
      };
    }
  }
);

// Get Organization Balance tool
server.tool(
  "get-organization-balance",
  "Get the current balance of the organization",
  {},  // No parameters needed
  async () => {
    try {
      const response = await fetch("http://app.localopfin.com/v2/api/organization/balance", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const balanceInRupees = (data.balance / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });

      return {
        content: [{
          type: "text",
          text: `Organization Balance: ${balanceInRupees}`
        }]
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{
          type: "text",
          text: `Failed to fetch organization balance: ${errorMessage}`
        }],
        isError: true
      };
    }
  }
);

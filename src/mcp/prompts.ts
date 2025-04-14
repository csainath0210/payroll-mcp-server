import { z } from "zod";
import { server } from "./server.js";

// Ask question prompt
server.prompt(
  "ask-question",
  "Prepares a question to be answered",
  { question: z.string().describe("The question to be answered") },
  ({ question }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Please answer this question: ${question}`,
        },
      },
    ],
  })
);

// Greeting prompt
server.prompt(
  "greeting",
  "A friendly greeting message",
  async () => {
    return {
      messages: [{
        role: "assistant",
        content: {
          type: "text",
          text: "Hello! I'm your payroll assistant. How can I help you today?"
        }
      }]
    };
  }
);

// Help prompt
server.prompt(
  "help",
  "Provides help information about available commands",
  async () => {
    return {
      messages: [{
        role: "assistant",
        content: {
          type: "text",
          text: "I can help you with:\n" +
            "- Creating new employees or contractors (use 'create-people')\n" +
            "- Editing employee or contractor details (use 'edit-people')\n" +
            "- Setting employee salary structure (use 'set-salary')\n" +
            "- Dismissing employees or contractors (use 'dismiss-people')\n" +
            "- Managing employee attendance and leaves (use 'modify-attendance')\n" +
            "- Editing existing attendance records (use 'edit-attendance')\n" +
            "- Fetching employee attendance records (use 'fetch-attendance')\n" +
            "- Viewing information about specific people (use 'view-people')\n" +
            "- Viewing all people with filtering options (use 'view-all-people')\n" +
            "- Viewing employee payroll information (use 'view-payroll')\n" +
            "- Adding payroll additions like bonuses (use 'add-payroll-additions')\n" +
            "- Adding payroll deductions (use 'add-payroll-deductions')\n" +
            "- Pausing/resuming employee payroll (use 'toggle-payroll')\n" +
            "- Getting payroll information with filtering options (use 'get-run-payroll')\n" +
            "- Getting organization's current balance (use 'get-organization-balance')\n" +
            "- Executing payroll for a specific month (use 'execute-payroll')\n" +
            "- Finalizing payroll for a month (use 'finalize-payroll')\n" +
            "- Unfinalizing payroll for a month (use 'unfinalize-payroll')\n" +
            "- Getting help (use 'help')\n\n" +
            "Just let me know what you'd like to do!"
        }
      }]
    };
  }
);

// Error prompt
server.prompt(
  "error",
  "Handles error messages",
  (extra) => {
    return {
      messages: [{
        role: "assistant",
        content: {
          type: "text",
          text: "An error occurred while processing your request. Please try again later."
        }
      }]
    };
  }
);

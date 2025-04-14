import { z } from "zod";
import { server } from "./server.js";
// Ask question prompt
server.prompt("ask-question", "Prepares a question to be answered", { question: z.string().describe("The question to be answered") }, ({ question }) => ({
    messages: [
        {
            role: "user",
            content: {
                type: "text",
                text: `Please answer this question: ${question}`,
            },
        },
    ],
}));
// Greeting prompt
server.prompt("greeting", "A friendly greeting message", async () => {
    return {
        messages: [{
                role: "assistant",
                content: {
                    type: "text",
                    text: "Hello! I'm your payroll assistant. How can I help you today?"
                }
            }]
    };
});
// Help prompt
server.prompt("help", "Provides help information about available commands", async () => {
    return {
        messages: [{
                role: "assistant",
                content: {
                    type: "text",
                    text: "I can help you with:\n" +
                        "- Viewing information about specific people (use 'view-people')\n" +
                        "- Viewing all people with filtering options (use 'view-all-people')\n" +
                        "- Getting help (use 'help')\n\n" +
                        "Just let me know what you'd like to do!"
                }
            }]
    };
});
// Error prompt
server.prompt("error", "Handles error messages", (extra) => {
    return {
        messages: [{
                role: "assistant",
                content: {
                    type: "text",
                    text: "An error occurred while processing your request. Please try again later."
                }
            }]
    };
});
//# sourceMappingURL=prompts.js.map
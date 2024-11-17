const tools = [
    {
        type: "function",
        function: {
            name: "openGoogle",
            description: "Open the browser and perform a Google search based on the user's query.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query to be used in Google search.",
                    },
                },
                required: ["query"],
                additionalProperties: false,
            },
        },
    },
    {
        type: "function",
        function: {
            name: "generateProfile",
            description: "This function can generate a specific agent profile for you based on the parameters.",
            parameters: {
                type: "object",
                properties: {
                    taskDescription: {
                        type: "string",
                        description: "Describe the tasks you want to accomplish with AI.",
                    },
                    industry: {
                        type: "string",
                        description: "What industry is this applicable for.",
                    },
                    additionalRequirements: {
                        type: "string",
                        description: "Any extra requirements the user has of the AI.",
                    },
                    model: {
                        type: "string",
                        description: "The AI model used to generate the profile.",
                    },
                },
                required: ["taskDescription", "industry", "additionalRequirements", "model"],
                additionalProperties: false,
            },
        },
    },
];

module.exports = tools;
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
    {
        type: "function",
        function: {
            name: "getCalendarEvents",
            description: "You can use the Google API to fetch the user's events based on time period.",
            parameters: {
                type: "object",
                properties: {
                    timePeriod: {
                        type: "string",
                        description: "Allows you to control the time period of events retrieved. All values include today.",
                        enum: ["last 30 days", "last week", "today", "next week", "next 30 days"],
                    },
                    query: {
                        type: "string",
                        description: "The query the user is asking about his past events.",
                    },
                },
                required: ["timePeriod", "query"],
                additionalProperties: false,
            },
        },
    },
    {
        type: "function",
        function: {
            name: "saveEvent",
            description: "Saves an event to the user's Google Calendar.",
            parameters: {
                type: "object",
                properties: {
                    summary: {
                        type: "string",
                        description: "The title or summary of the event.",
                    },
                    location: {
                        type: "string",
                        description: "The location where the event will take place.",
                    },
                    description: {
                        type: "string",
                        description: "A detailed description of the event.",
                    },
                    start: {
                        type: "string",
                        description: "The start date and time of the event in ISO 8601 format.",
                    },
                    end: {
                        type: "string",
                        description: "The end date and time of the event in ISO 8601 format.",
                    },
                },
                required: ["summary", "location", "description", "start", "end"],
                additionalProperties: false,
            },
        },
    },
    {
        type: "function",
        function: {
            name: "patchUserInformation",
            description: "Updates user information using optional parameters.",
            parameters: {
                type: "object",
                properties: {
                    userName: {
                        type: "string",
                        description: "Optional new user name.",
                    },
                    age: {
                        type: "integer",
                        description: "Optional new age.",
                    },
                    gender: {
                        type: "string",
                        description: "Optional new gender.",
                    },
                    assessmentSummary: {
                        type: "string",
                        description: "Optional new assessment summary.",
                    },
                },
                required: [],
                additionalProperties: false,
            },
        },
    }
];

module.exports = tools;
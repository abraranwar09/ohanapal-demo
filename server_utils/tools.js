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
            description: "Updates/Saves new user information using optional parameters. You can use this to update the user's name, age, gender and assessment summary as needed. When assessment is complete, set isAssessmentComplete to true. Please provide all parameters for the function to work. even if they haven't changed.",
            parameters: {
                type: "object",
                properties: {
                    userName: {
                        type: "string",
                        description: "New user name.",
                    },
                    age: {
                        type: "integer",
                        description: "The users age.",
                    },
                    gender: {
                        type: "string",
                        description: "The user's gender.",
                    },
                    assessmentSummary: {
                        type: "string",
                        description: "The summary of the full assessment of the users capabilities and pain points.",
                    },
                    isAssessmentComplete: {
                        type: "boolean",
                        description: "Whether the assessment is complete or not. Only set this to true if the assessment is complete.",
                    },
                },
                required: [],
                additionalProperties: false,
            },
        },
    },
    {
        type: "function",
        function: {
            name: "cameraCapture",
            description: "Take pictures from a camera connected to the user's Raspberry Pi. Helps get context about their room, surroundings and help them.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The query the user has about the image (helps with image analysis).",
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
            name: "executeComputerCommand",
            description: "Executes a safe computer control command through Claude's API",
            parameters: {
                type: "object",
                properties: {
                    command: {
                        type: "string",
                        description: "The command to execute (will be validated for safety)"
                    }
                },
                required: ["command"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "getUserLocation",
            description: "Allows you to get detailed information about the user's locale, timezone, exact latitude and longitude, city, region, and more.",
            parameters: {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
            },
        },
    }
];

module.exports = tools;
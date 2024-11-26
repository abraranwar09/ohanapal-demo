const tools = [
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
    // {
    //     type: "function",
    //     function: {
    //         name: "cameraCapture",
    //         description: "Take pictures from a camera connected to the user's Raspberry Pi. Helps get context about their room, surroundings and help them.",
    //         parameters: {
    //             type: "object",
    //             properties: {
    //                 query: {
    //                     type: "string",
    //                     description: "The query the user has about the image (helps with image analysis).",
    //                 },
    //             },
    //             required: ["query"],
    //             additionalProperties: false,
    //         },
    //     },
    // },
    {
        type: "function",
        function: {
            name: "executeComputerCommand",
            description: "Executes a safe computer control command through our computer control API. You can send any natural language command to control the computer not a bash command.",
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
    },
    {
        type: "function",
        function: {
            name: "usePerplexity",
            description: "Search for information on the web using Perplexity AI. Whenever asked to search the web, use this tool.",
            parameters: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "The search query to look up using Perplexity.",
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
            name: "listGmailMessages",
            description: "Fetches a list of Gmail messages based on the specified query parameters.",
            parameters: {
                type: "object",
                properties: {
                    // query: {
                    //     type: "string",
                    //     description: "The search query to filter Gmail messages.",
                    // },
                    maxResults: {
                        type: "integer",
                        description: "The maximum number of messages to retrieve.",
                    }
                },
                required: ["query"],
                additionalProperties: false,
            },
        },
    },
    {
        type: "function",
        function: {
            name: "getGmailMessage",
            description: "Fetches details of a specific Gmail message using its messageId. Use this tool only when the user provides a messageId and explicitly asks for Gmail message details.",
            parameters: {
                type: "object",
                properties: {
                    messageId: {
                        type: "string",
                        description: "The ID of the Gmail message to retrieve.",
                    },
                },
                required: ["messageId"],
                additionalProperties: false,
            },
        },
    },
    {
        type: "function",
        function: {
            name: "sendGmailMessage",
            description: "Sends an email through Gmail with the specified parameters.",
            parameters: {
                type: "object",
                properties: {
                    to: {
                        type: "string",
                        description: "Email address of the recipient.",
                    },
                    subject: {
                        type: "string",
                        description: "Subject line of the email.",
                    },
                    body: {
                        type: "string",
                        description: "Content of the email message.",
                    },
                    cc: {
                        type: "string",
                        description: "Email addresses to CC (comma-separated). Send empty string if not needed.",
                    },
                    bcc: {
                        type: "string",
                        description: "Email addresses to BCC (comma-separated). Send empty string if not needed.",
                    },
                    isHtml: {
                        type: "boolean",
                        description: "Whether the email body contains HTML formatting. Send false if not needed.",
                    },
                },
                required: ["to", "subject", "body"],
                additionalProperties: false,
            },
        },
    },
];

module.exports = tools;
async function handleToolCalls(parsedResult) {
    if (parsedResult.finish_reason === 'tool_calls') {
        console.log(parsedResult.tool_calls[0].function.name);
        const functionName = parsedResult.tool_calls[0].function.name;
        const args = JSON.parse(parsedResult.tool_calls[0].function.arguments);

        switch (functionName) {
            case 'openGoogle':
                openGoogle(args.query, parsedResult.tool_calls[0].id);
                break;
            case 'generateProfile':
                generateProfile(args.taskDescription, args.industry, args.additionalRequirements, args.model);
                break;
            case 'getCalendarEvents':
                getCalendarEvents(args.timePeriod, args.query);
                break;
            case 'saveEvent':
                saveEvent(args.summary, args.location, args.description, args.start, args.end);
                break;
            case 'patchUserInformation':
                patchUserInformation(args.userName, args.age, args.gender, args.assessmentSummary);
                break;
            case 'cameraCapture':
                cameraCapture(args.query);
                break;
            case 'executeComputerCommand':
                executeComputerCommand(args.command);
                break;
            default:
                console.warn(`Unhandled function name: ${functionName}`);
        }
    }
}


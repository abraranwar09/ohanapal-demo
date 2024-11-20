async function handleToolCalls(parsedResult) {
    if (parsedResult.finish_reason === 'tool_calls') {
        console.log(parsedResult.tool_calls[0].function.name);
        const functionName = parsedResult.tool_calls[0].function.name;
        const args = JSON.parse(parsedResult.tool_calls[0].function.arguments);

        switch (functionName) {
            case 'openGoogle':
                openGoogle(args.query, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'generateProfile':
                generateProfile(args.taskDescription, args.industry, args.additionalRequirements, args.model, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'getCalendarEvents':
                getCalendarEvents(args.timePeriod, args.query, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'saveEvent':
                saveEvent(args.summary, args.location, args.description, args.start, args.end, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'patchUserInformation':
                patchUserInformation(args.userName, args.age, args.gender, args.assessmentSummary, args.isAssessmentComplete, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'cameraCapture':
                cameraCapture(args.query, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'executeComputerCommand':
                executeComputerCommand(args.command, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'getUserLocation':
                getUserLocation(parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'usePerplexity':
                usePerplexity(args.query, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'listGmailMessages':
                listGmailMessages(args.maxResults, args.query, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'getGmailMessage':
                getGmailMessage(args.messageId, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            case 'sendGmailMessage':
                sendGmailMessage(args.to, args.subject, args.body, args.cc, args.bcc, args.isHtml, parsedResult.tool_calls[0].id, parsedResult.tool_call_message);
                break;
            default:
                console.warn(`Unhandled function name: ${functionName}`);
        }
    }
}


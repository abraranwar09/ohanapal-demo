Install required packages:
bash
sudo apt-get update
sudo apt-get install -y python3-picamera2 imagemagick


Create the camera capture script at /home/pi/capture_image.sh:
bash
#!/bin/bash
# Capture image using libcamera
libcamera-still -n -o temp.jpg --immediate -t 1

# Convert to base64
base64 temp.jpg

# Clean up
rm temp.jpg


Set permissions:
bash
chmod +x /home/pi/capture_image.sh


# Computer Control Tool
Install Docker
bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh


3. Tool Integration
The tools are integrated through the agent service. Reference implementation:
bash
const SYSTEM_PROMPT = `You are an AI assistant with specific capabilities through function calling. Your primary focus is vision processing (99% of interactions), with optional computer control capabilities (1% of interactions) and advanced memory and file operations.
const SYSTEM_PROMPT = `You are an AI assistant with specific capabilities through function calling. Your primary focus is vision processing (99% of interactions), with optional computer control capabilities (1% of interactions) and advanced memory and file operations.
Available Functions:
Available Functions:
1. Vision Processing (processVision)
   - Primary function - Use this for most interactions
   - Captures and analyzes images from the connected camera
   - Returns detailed descriptions of what the camera sees
   - Example use: Analyzing objects, reading text, describing scenes
   - Example use: Analyzing objects, reading text, describing scenes
2. Computer Control (executeComputerCommand)
   - Secondary function - Use sparingly and only when explicitly needed
   - Executes safe computer commands via Claude's API
   - All commands are validated for safety before execution
   - Example use: Opening applications, basic file operations
   - Example use: Opening applications, basic file operations
3. Memory Operations
   - storeMemory: Store key-value pairs for later retrieval
   - retrieveMemory: Retrieve previously stored information
   - Example use: Maintaining context, storing user preferences
   - Example use: Maintaining context, storing user preferences
4. File Operations
   - readFile: Read contents of a file
   - writeFile: Create or update a file
   - editFile: Modify existing file contents
   - Example use: Configuration management, data persistence
   - Example use: Configuration management, data persistence
5. Web Search (webSearch)
   - Supporting function for gathering information
   - Uses Perplexity API for accurate, up-to-date information
   - Returns structured results with sources
   - Example use: Fact checking, current events, supplementary information
   - Example use: Fact checking, current events, supplementary information
6. DateTime (getDateTime)
   - Utility function for temporal context
   - Provides accurate system time and date information
   - Example use: Time-based operations, scheduling
   - Example use: Time-based operations, scheduling
Guidelines:
- Prefer vision processing for most tasks (99% usage)
- Use computer control only when specifically requested (1% usage)
- Utilize memory operations to maintain context across interactions
- Handle file operations with proper error checking
- Combine tools when needed for comprehensive responses
- Always provide clear explanations of tool usage
- Handle errors gracefully with informative messages
- Handle errors gracefully with informative messages
Current date: ${new Date().toLocaleDateString()}
Current time: ${new Date().toLocaleTimeString()}
Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;


Vision Tool Implementation
The vision processing is handled through:
ts
export async function processVisionRequest() {
  const ssh = await getSSHConnection();
  const ssh = await getSSHConnection();
  try {
    // Execute camera capture script on Raspberry Pi
    const result = await ssh.execCommand('bash /home/pi/capture_image.sh');
    const result = await ssh.execCommand('bash /home/pi/capture_image.sh');
    if (result.code !== 0) {
      throw new Error(`Camera capture failed: ${result.stderr}`);
    }
    }
    const base64Image = result.stdout.trim();
    const base64Image = result.stdout.trim();
    // Analyze image using OpenAI Vision API
    const analysis = await analyzeImage(base64Image);
    const analysis = await analyzeImage(base64Image);
    await db.insert(systemLogs).values({
      level: 'info',
      message: 'Vision processing completed successfully',
      metadata: { timestamp: new Date() }
    });
    });
    return {
      success: true,
      analysis: analysis
    };
    };
  } catch (error) {
    await db.insert(systemLogs).values({
      level: 'error',
      message: 'Vision processing failed',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    });
    throw error;
  } finally {
    ssh.dispose();
  }
  }
}
async function analyzeImage(base64Image: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Please analyze this image and describe what you see in detail."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
              }
          ],
        },
      ],
      max_tokens: 500,
    });
    });
    return response.choices[0]?.message?.content || 'No analysis available';
  } catch (error) {
    throw new Error(`Vision API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  }


Computer Control Implementation
Computer control commands are processed through:
ts
export async function executeComputerCommand(command: string) {
  try {
    // Validate command through Claude first
    const validationResult = await validateCommand(command);
    const validationResult = await validateCommand(command);
    if (!validationResult.safe) {
      throw new Error('Command validation failed: Potentially unsafe operation');
    }
    }
    // Execute the validated command through Claude's computer use API
    const execution = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1024,
      system: "You are a computer control assistant. Execute commands safely and report results clearly.",
      messages: [{
        role: 'user',
        content: `Execute this command and report the results: ${command}`
      }]
    });
    });
    const result = execution.content[0].text;
    const result = execution.content[0].text;
    await db.insert(systemLogs).values({
      level: 'info',
      message: 'Computer command executed successfully',
      metadata: {
        command,
        result,
        timestamp: new Date()
      }
    });
    });
    return {
      success: true,
      result: result
    };
    };
  } catch (error) {
    await db.insert(systemLogs).values({
      level: 'error',
      message: 'Computer command execution failed',
      metadata: {
        command,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    });
    throw error;
  }
  }


4. API Integration
The client-side API integration is handled through:
ts
export async function processVision() {
  return await fetcher("/api/vision/process", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    }
  });
  });
}
export async function executeComputerControl(command: string) {
  return await fetcher("/api/computer/execute", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ command }),
  });
  });
}
export async function queryAgent(query: string): Promise<AgentResponse> {
  try {
    const response = await fetcher("/api/agent/query", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query }),
    });
    });
    return {
      success: true,
      message: response.result,
      toolResults: response.toolResults
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || 'Failed to process query'
      };
      };
    return {
      success: false,
      error: 'An unknown error occurred'
    };
    };
  }


rs
Security Considerations
SSH keys must be properly generated and secured
All computer control commands must be validated through Claude before execution
API keys must be properly secured in environment variables
Docker container isolation for computer control tasks
Limited system access via SSH
Proper error handling and logging


Required Environment Variables
bash
# OpenAI API for vision processing
OPENAI_API_KEY=<your-key>

# Anthropic API for computer control
ANTHROPIC_API_KEY=<your-key>

# Raspberry Pi SSH Configuration
RASPBERRY_PI_HOST=<ip-or-hostname>
RASPBERRY_PI_USER=<username>
SSH_PRIVATE_KEY_PATH=<path>

# Optional: Vision Processing Choice
VISION_PROCESSOR=openai # or 'ollama' for local processing


bash
Testing the Integration
Test SSH Connection:
await checkSSHConnection();


bash
Test Vision Processing:
const visionResult = await processVisionRequest();
console.log(visionResult.analysis);


bash
Test Computer Control:
const commandResult = await executeComputerCommand('echo "test"');
console.log(commandResult.result);


bash
Error Handling
The system includes comprehensive error handling and logging. All errors are logged to the database through the systemLogs table. Reference implementation:
  } catch (error) {
    await db.insert(systemLogs).values({
      level: 'error',
      message: 'Vision processing failed',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      }
    });
    throw error;
  } finally {
    

Monitoring
System status can be monitored through the status check endpoint:
async function checkSystemStatus() {
  const sshStatus = await checkSSHConnection();
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
  return {
    camera: true,
    ssh: sshStatus,
    apis: hasOpenAI && hasAnthropic
  };
  };





##TOOLS
  ts
  const tools = [
  {
    type: "function",
    function: {
      name: "processVision",
      description: "Primary tool (99% usage) - Captures and analyzes an image from the connected camera",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "executeComputerCommand",
      description: "Secondary tool (1% usage) - Executes a safe computer control command through Claude's API",
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
      name: "storeMemory",
      description: "Store information in memory for later retrieval",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "The key to store the value under"
          },
          value: {
            type: "string",
            description: "The value to store"
          }
        },
        required: ["key", "value"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "retrieveMemory",
      description: "Retrieve previously stored information from memory",
      parameters: {
        type: "object",
        properties: {
          key: {
            type: "string",
            description: "The key of the value to retrieve"
          }
        },
        required: ["key"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "readFile",
      description: "Read the contents of a file",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "The path to the file to read"
          }
        },
        required: ["filePath"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "writeFile",
      description: "Write content to a file",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "The path where to write the file"
          },
          content: {
            type: "string",
            description: "The content to write to the file"
          }
        },
        required: ["filePath", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "editFile",
      description: "Modify the contents of an existing file",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
            description: "The path to the file to edit"
          },
          modification: {
            type: "string",
            description: "The modification to apply to the file content"
          }
        },
        required: ["filePath", "modification"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "webSearch",
      description: "Supporting tool - Search the web for real-time information using Perplexity API",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to execute"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getDateTime",
      description: "Get current system time information",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  }
];


```ts
const tools = [
  {
    type: "function" as const,
    function: {
      name: "processVision",
      description: "Primary tool (99% usage) - Captures and analyzes an image from the connected camera",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
      }
  },
  {
    type: "function" as const,
    function: {
      name: "executeComputerCommand",
      description: "Secondary tool (1% usage) - Executes a safe computer control command through Claude's API",
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
  

  ts
  export async function processQuery(query: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query }
      ],
      tools,
      tool_choice: 'auto'
    });
    });
    const message = completion.choices[0].message;
    let response = message.content || '';
    let toolResults: { tool: string; result: any }[] = [];
    let toolResults: { tool: string; result: any }[] = [];
    if (message.tool_calls) {
      const results = await Promise.all(
        message.tool_calls.map(async (toolCall) => {
          const result = await handleToolCall(toolCall);
          toolResults.push({
            tool: toolCall.function.name,
            result: result.success ? result.result : result.error
          });
          return { toolCall, result };
        })
      );
      );
      const toolMessages = results.map(({ toolCall, result }) => ({
        role: 'tool' as const,
        tool_call_id: toolCall.id,
        content: JSON.stringify(result)
      }));
      }));
      const finalCompletion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: query },
          message,
          ...toolMessages
        ]
      });
      });
      response = finalCompletion.choices[0].message.content || '';
    }

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { writeFileSync } = require('node:fs');
const OpenAI = require('openai');
const SessionMessage = require('../models/sessionMessageModel');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const path = require('path');
const tools = require('../server_utils/tools'); // Import the tools array


const openai = new OpenAI();





router.post('/process', upload.single('audioFile'), async (req, res) => {
    const { prompt, session_id, system_message } = req.body;
    const audioFilePath = req.file.path;
   
    //set system message
    const systemMessage = { 
        role: "system", 
        content: [{ type: "text", text: `${system_message}` }]
    };

    try {
        let sessionMessage = await SessionMessage.findOne({ sessionId: session_id });
        if (!sessionMessage) {
            sessionMessage = new SessionMessage({ 
                sessionId: session_id, 
                messages: [systemMessage]
            });
        }

        const buffer = await fs.promises.readFile(audioFilePath);
        const base64str = buffer.toString("base64");

        sessionMessage.messages.push({
            role: "user",
            content: [
                { type: "text", text: prompt },
                { type: "input_audio", input_audio: { data: base64str, format: "wav" }}
            ]
        });

        const removeIdFields = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(removeIdFields);
            } else if (obj !== null && typeof obj === 'object') {
                const { _id, ...rest } = obj;
                return Object.keys(rest).reduce((acc, key) => {
                    acc[key] = removeIdFields(rest[key]);
                    return acc;
                }, {});
            }
            return obj;
        };

        const messagesWithoutId = sessionMessage.messages.map(message => removeIdFields(message.toObject()));

        const response = await openai.chat.completions.create({
            model: "gpt-4o-audio-preview",
            modalities: ["text", "audio"],
            audio: { voice: "alloy", format: "wav" },
            messages: messagesWithoutId,
            tools: tools
        });

        console.log(response.choices[0]);

        const finishReason = response.choices[0].finish_reason;

        if (finishReason === 'tool_calls') {
            res.json({
                finish_reason: finishReason,
                tool_calls: response.choices[0].message.tool_calls,
                tool_call_id: response.choices[0].message.tool_calls.id 
            });
        } else {
            const audioData = response.choices[0].message.audio.data;
            const transcript = response.choices[0].message.audio.transcript;

            const audioBuffer = Buffer.from(audioData, 'base64');

            res.json({
                audio: audioBuffer.toString('base64'),
                transcript: transcript,
                finish_reason: finishReason
            });

            sessionMessage.messages.push({
                role: "assistant",
                audio: { id: response.choices[0].message.audio.id }
            });

            await sessionMessage.save();
        }

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).send('Error processing audio: ' + error.message);
        } else {
            console.error('Error after headers sent:', error);
        }
    } finally {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting uploaded file:', err);
            });
        }
    }
});


router.post('/submit-tool-call', async (req, res) => {
    const { session_id, tool_call_id, tool_call_results } = req.body;

    try {
        // Retrieve previous messages using session_id
        let sessionMessage = await SessionMessage.findOne({ sessionId: session_id });
        if (!sessionMessage) {
            return res.status(404).send('Session not found');
        }

        // Remove _id fields from messages
        const removeIdFields = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(removeIdFields);
            } else if (obj !== null && typeof obj === 'object') {
                const { _id, ...rest } = obj;
                return Object.keys(rest).reduce((acc, key) => {
                    acc[key] = removeIdFields(rest[key]);
                    return acc;
                }, {});
            }
            return obj;
        };

        const messagesWithoutId = sessionMessage.messages.map(message => removeIdFields(message.toObject()));

        // Add the tool call result to the messages array
        const function_call_result_message = {
            role: "tool",
            content: [
                { type: "text", text: tool_call_results }
            ],
            tool_call_id: tool_call_id
        };
        messagesWithoutId.push(function_call_result_message);

        // Generate an audio response
        const response = await openai.chat.completions.create({
            model: "gpt-4o-audio-preview",
            modalities: ["text", "audio"],
            audio: { voice: "alloy", format: "wav" },
            messages: messagesWithoutId
        });

        console.log(response.choices[0]);

        const finishReason = response.choices[0].finish_reason;
        const audioData = response.choices[0].message.audio.data;
        const transcript = response.choices[0].message.audio.transcript;

        // Convert base64 audio data to a buffer
        const audioBuffer = Buffer.from(audioData, 'base64');

        // Set headers for the response
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', 'attachment; filename="response.wav"');

        // Send the audio buffer, transcript, and finish reason
        res.json({
            audio: audioBuffer.toString('base64'), // Send as base64 if needed
            transcript: transcript,
            finish_reason: finishReason
        });

        // Save the new message to the session
        sessionMessage.messages.push({
            role: "assistant",
            audio: { id: response.choices[0].message.audio.id }
        });

        await sessionMessage.save();

    } catch (error) {
        res.status(500).send('Error processing tool call: ' + error.message);
    }
});

router.post('/process-text', async (req, res) => {
    const { user_text, session_id, system_message } = req.body;

    // Set system message
    const systemMessage = { 
        role: "system", 
        content: [{ type: "text", text: `${system_message}` }]
    };

    try {
        let sessionMessage = await SessionMessage.findOne({ sessionId: session_id });
        if (!sessionMessage) {
            sessionMessage = new SessionMessage({ 
                sessionId: session_id, 
                messages: [systemMessage]
            });
        }

        // Wrap the user_text in an object with a 'text' property
        sessionMessage.messages.push({
            role: "user",
            content: [{ type: "text", text: user_text }] // Adjusted to match expected schema
        });

        const removeIdFields = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(removeIdFields);
            } else if (obj !== null && typeof obj === 'object') {
                const { _id, ...rest } = obj;
                return Object.keys(rest).reduce((acc, key) => {
                    acc[key] = removeIdFields(rest[key]);
                    return acc;
                }, {});
            }
            return obj;
        };

        const messagesWithoutId = sessionMessage.messages.map(message => removeIdFields(message.toObject()));

        const response = await openai.chat.completions.create({
            model: "gpt-4o-audio-preview",
            modalities: ["text", "audio"],
            audio: { voice: "alloy", format: "wav" },
            messages: messagesWithoutId,
            tools: tools
        });

        console.log(response.choices[0]);

        const finishReason = response.choices[0].finish_reason;

        if (finishReason === 'tool_calls') {
            res.json({
                finish_reason: finishReason,
                tool_calls: response.choices[0].message.tool_calls,
                tool_call_id: response.choices[0].message.tool_calls.id 
            });
        } else {
            const audioData = response.choices[0].message.audio.data;
            const transcript = response.choices[0].message.audio.transcript;

            // Convert base64 audio data to a buffer
            const audioBuffer = Buffer.from(audioData, 'base64');

            // Send the audio buffer, transcript, and finish reason
            res.json({
                audio: audioBuffer.toString('base64'), // Send as base64 if needed
                transcript: transcript,
                finish_reason: finishReason
            });

            // Add the assistant's response to the session messages
            sessionMessage.messages.push({
                role: "assistant",
                audio: { id: response.choices[0].message.audio.id }
            });

            // Save the updated session message to the database
            await sessionMessage.save();
        }

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).send('Error processing text: ' + error.message);
        } else {
            console.error('Error processing text after headers sent:', error);
        }
    }
});

router.post('/process-image', async (req, res) => {
    const { base64_image, query } = req.body;


    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: query },
                        {
                            type: "image_url",
                            image_url: {
                                url: `${base64_image}`,
                            },
                        },
                    ],
                },
            ],
        });

        console.log(response.choices[0]);

        res.json({
            message: response.choices[0].message.content,
            finish_reason: response.choices[0].finish_reason
        });

    } catch (error) {
        res.status(500).send('Error processing image: ' + error.message);
    }
});


module.exports = router;



const mongoose = require('mongoose');

const sessionMessageSchema = new mongoose.Schema({
    sessionId: { type: String, required: true },
    messages: [
        {
            role: { type: String, required: true },
            content: [
                {
                    type: { type: String, required: true },
                    text: { type: String },
                    input_audio: {
                        data: { type: String },
                        format: { type: String }
                    }
                }
            ],
            audio: {
                id: { type: String }
            }
        }
    ]
});

module.exports = mongoose.model('SessionMessage', sessionMessageSchema);
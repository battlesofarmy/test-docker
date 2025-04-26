const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    code: { type: String, required: true },
    language: { type: String, default: 'cpp' },
    results: [{
        testCase: { type: mongoose.Schema.Types.ObjectId },
        output: String,
        expectedOutput: String,
        passed: Boolean,
        runtime: Number,
        memory: Number,
        error: String
    }],
    passedAll: Boolean,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);
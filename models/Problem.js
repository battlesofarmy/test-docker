const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true }
});

const problemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    testCases: [testCaseSchema],
    timeLimit: { type: Number, default: 2 }, // seconds
    memoryLimit: { type: Number, default: 256 } // MB
});

module.exports = mongoose.model('Problem', problemSchema);
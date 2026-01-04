"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailySummary = void 0;
const generateDailySummary = async (careProfileName, date, entries) => {
    // In a real app, this would call DigitalOcean Gradient AI
    // For now, returning a mock response to allow development without API keys
    if (process.env.GRADIENT_API_KEY === 'dev-key') {
        return {
            summaryText: `Mock summary for ${careProfileName} on ${date}. Things went well overall.`,
            insightsJson: {
                positives: ["Alex finished his lunch", "Good nap in the afternoon"],
                concerns: ["Slightly fussy in the evening"],
                flags: []
            },
            modelName: "mock-model"
        };
    }
    // Implementation for real Gradient AI would go here
    // using fetch to the inference endpoint
    throw new Error("Gradient AI real implementation not yet active");
};
exports.generateDailySummary = generateDailySummary;
//# sourceMappingURL=gradient.js.map
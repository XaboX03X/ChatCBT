// backend/utils/anxietyMath.js

const emotionWeights = {
    fear: 9.5, nervousness: 8.5, panic: 9.5,
    anger: 8.0, annoyance: 7.0, disapproval: 6.0,
    sadness: 7.5, grief: 8.5, disappointment: 6.5,
    confusion: 6.0,
    neutral: 4.0,
    calmness: 2.0, relief: 2.5, joy: 1.5, amusement: 1.0
};

export function calculateAnxietyEMA(classificationResults, previousAnxiety) {
    const ALPHA = 0.3; 
    const primaryEmotion = classificationResults[0]?.label || 'neutral';
    const targetArousal = emotionWeights[primaryEmotion] || 4.0;

    let newScore = (targetArousal * ALPHA) + (previousAnxiety * (1 - ALPHA));
    return Math.max(1.0, Math.min(10.0, Number(newScore.toFixed(1))));
}
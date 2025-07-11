import { Question } from '../types';

// JSON structure from the question bank
interface RawQuestion {
    Question: string;
    'Possible answers': string;
    'Correct answer & Explanation': string;
}

const parseOptions = (possibleAnswers: string): string[] => {
    // Split by newlines and filter for lines that start with A), B), C), D)
    const lines = possibleAnswers.split('\n').filter(line => line.trim());
    const options: string[] = [];

    // Debug logging
    console.log('Parsing options from:', possibleAnswers);

    for (const line of lines) {
        // Match the entire line after the letter and parenthesis
        const match = line.match(/^([A-D])\)(.*)/);
        if (match) {
            // Keep the full text including any commas, but remove any trailing comma
            const optionText = match[2].trim().replace(/,$/, '');
            options.push(optionText);
            console.log(`Parsed option ${match[1]}: "${optionText}"`);
        }
    }

    return options;
};

const parseCorrectAnswerAndExplanation = (
    content: string
): { answer: string; explanation: string } => {
    // Extract correct answer letter
    const answerMatch = content.match(/Correct Answer:\s*([A-D])/i);
    const answer = answerMatch ? answerMatch[1].toUpperCase() : '';

    // Extract explanation text (everything after "Explanation:")
    const explanationMatch = content.match(/Explanation:\s*([\s\S]*)/i);
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';

    return { answer, explanation };
};

export const parseJSON = (jsonContent: string): Question[] => {
    const questions: Question[] = [];

    try {
        const rawQuestions: RawQuestion[] = JSON.parse(jsonContent);

        console.log(
            `Starting to parse JSON with ${rawQuestions.length} questions`
        );

        for (let i = 0; i < rawQuestions.length; i++) {
            const rawQuestion = rawQuestions[i];

            try {
                // Validate required fields
                if (
                    !rawQuestion.Question ||
                    !rawQuestion['Possible answers'] ||
                    !rawQuestion['Correct answer & Explanation']
                ) {
                    console.warn(
                        `Skipping question ${i}: Missing required fields`
                    );
                    continue;
                }

                // Parse options from possible answers
                const options = parseOptions(rawQuestion['Possible answers']);
                if (options.length < 2) {
                    console.warn(
                        `Skipping question ${i}: Could not parse enough options`,
                        {
                            possibleAnswers: rawQuestion[
                                'Possible answers'
                            ].substring(0, 100),
                        }
                    );
                    continue;
                }

                // Parse correct answer and explanation
                const { answer, explanation } =
                    parseCorrectAnswerAndExplanation(
                        rawQuestion['Correct answer & Explanation']
                    );
                if (!answer) {
                    console.warn(
                        `Skipping question ${i}: Could not find correct answer`,
                        {
                            content: rawQuestion[
                                'Correct answer & Explanation'
                            ].substring(0, 100),
                        }
                    );
                    continue;
                }

                const question: Question = {
                    id: `q-${i + 1}`,
                    question: rawQuestion.Question.trim(),
                    options: options,
                    answer: answer,
                    explanation: explanation,
                };

                questions.push(question);

                if (i < 3) {
                    console.log(`Successfully parsed question ${i + 1}:`, {
                        question: question.question.substring(0, 50) + '...',
                        optionsCount: options.length,
                        answer: answer,
                        explanationLength: explanation.length,
                    });
                }
            } catch (error) {
                console.warn(`Error parsing question ${i}:`, error);
            }
        }

        console.log(
            `Parsing complete. Successfully parsed ${questions.length} questions out of ${rawQuestions.length} raw questions`
        );

        if (questions.length === 0) {
            console.error(
                'No questions were parsed! Check the JSON format and structure.'
            );
        }
    } catch (error) {
        console.error('Error parsing JSON:', error);
    }

    return questions;
};

export const loadQuestionsFromJSON = async (): Promise<Question[]> => {
    try {
        const response = await fetch('/dataset.json');
        if (!response.ok) {
            throw new Error(
                `Failed to load dataset: ${response.status} ${response.statusText}`
            );
        }

        const jsonContent = await response.text();
        const questions = parseJSON(jsonContent);

        console.log(`Loaded ${questions.length} questions from dataset.json`);
        return questions;
    } catch (error) {
        console.error('Error loading questions from JSON:', error);
        throw error;
    }
};

// Keep the old function names for backward compatibility
export const parseCSV = parseJSON;
export const loadQuestionsFromCSV = loadQuestionsFromJSON;

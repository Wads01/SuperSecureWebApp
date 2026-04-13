export const MIN_PASSWORD_LENGTH = 12;
export const MIN_RESET_ANSWER_LENGTH = 3;
export const MIN_PASSWORD_AGE_MS = 3 * 60 * 1000;

const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;
const RESET_ANSWER_POLICY = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export function validatePasswordComplexity(password: string): string | null {
	if (password.length < MIN_PASSWORD_LENGTH) {
		return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
	}

	if (!PASSWORD_POLICY.test(password)) {
		return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.';
	}

	return null;
}

export function validateResetChallenge(question: string, answer: string): string | null {
	if (!question || question.trim().length < 10) {
		return 'Security question must be at least 10 characters long.';
	}

	if (answer.length < MIN_RESET_ANSWER_LENGTH) {
		return `Security answer must be at least ${MIN_RESET_ANSWER_LENGTH} characters long.`;
	}

	if (!RESET_ANSWER_POLICY.test(answer)) {
		return 'Security answer must include letters and numbers for stronger entropy.';
	}

	return null;
}

/**
 * Parses HTML using regex to find input elements and extract their values, plus logo image URL
 * @param html - The HTML string to parse
 * @param inputs - Array of input names to search for
 * @returns Object with input names as keys and their values, plus logoUrl property
 */
export function parseAndGetInputs(
	html: string,
	inputs: string[]
): Record<string, string | undefined> & { logoUrl?: string } {
	const result: Record<string, string | undefined> & { logoUrl?: string } = {}

	// Initialize all requested inputs as undefined
	inputs.forEach((inputName) => {
		result[inputName] = undefined
	})

	// Extract logo image URL
	const logoPattern = /<img[^>]*id\s*=\s*["']logo["'][^>]*>/i
	const logoMatch = html.match(logoPattern)
	if (logoMatch) {
		const srcMatch = logoMatch[0].match(/src\s*=\s*["']([^"']+)["']/i)
		result.logoUrl = srcMatch ? srcMatch[1] : undefined
	} else {
		result.logoUrl = undefined
	}

	// Regex pattern to match input elements with name and value attributes
	// This pattern handles various input formats and attribute orders
	const inputPattern = /<input[^>]*>/gi
	const matches = html.match(inputPattern)

	if (!matches) {
		return result
	}

	matches.forEach((inputTag) => {
		// Extract name attribute
		const nameMatch = inputTag.match(/name\s*=\s*["']([^"']+)["']/i)
		if (!nameMatch) return

		const inputName = nameMatch[1]

		// Only process if this input is in our requested list
		if (!inputs.includes(inputName)) return

		// Extract value attribute
		const valueMatch = inputTag.match(/value\s*=\s*["']([^"']*)["']/i)
		const value = valueMatch ? valueMatch[1] : ""

		result[inputName] = value
	})

	return result
}

/**
 * Alternative version that returns an array of all found inputs (not filtered by name)
 * @param html - The HTML string to parse
 * @returns Array of objects with name and value properties
 */
export function parseAllInputs(
	html: string
): Array<{ name: string; value: string }> {
	const result: Array<{ name: string; value: string }> = []

	const inputPattern = /<input[^>]*>/gi
	const matches = html.match(inputPattern)

	if (!matches) {
		return result
	}

	matches.forEach((inputTag) => {
		const nameMatch = inputTag.match(/name\s*=\s*["']([^"']+)["']/i)
		if (!nameMatch) return

		const name = nameMatch[1]
		const valueMatch = inputTag.match(/value\s*=\s*["']([^"']*)["']/i)
		const value = valueMatch ? valueMatch[1] : ""

		result.push({ name, value })
	})

	return result
}

export async function makeRequest(
	input: RequestInfo,
	init?: RequestInit
): Promise<Response> {
	return await fetch(input, {
		...init,
		headers: {
			...init?.headers,
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
		}
	})
}

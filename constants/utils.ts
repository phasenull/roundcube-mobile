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

/**
 * Extracts quota information from rcmail.set_quota JavaScript call in HTML
 * @param html - The HTML string containing the rcmail.set_quota call
 * @returns QuotaInfo object or null if not found
 */
export function getUsage(html: string): QuotaInfo | null {
	// Regex pattern to match rcmail.set_quota with its JSON argument
	const quotaPattern = /rcmail\.set_quota\s*\(\s*({[^}]+})\s*\)/i
	const match = html.match(quotaPattern)
	
	if (!match) {
		return null
	}

	try {
		// Parse the JSON object from the matched string
		const quotaJson = match[1]
		const quotaData = JSON.parse(quotaJson)
		
		// Validate that all expected properties exist
		const requiredFields = ['used', 'total', 'percent', 'free', 'type', 'folder', 'title']
		const hasAllFields = requiredFields.every(field => field in quotaData)
		
		if (!hasAllFields) {
			console.warn('Missing required fields in quota data:', quotaData)
			return null
		}
		
		return {
			used: quotaData.used,
			total: quotaData.total,
			percent: quotaData.percent,
			free: quotaData.free,
			type: quotaData.type,
			folder: quotaData.folder,
			title: quotaData.title
		}
	} catch (error) {
		console.error('Failed to parse quota JSON:', error)
		return null
	}
}

import { FetchResponse } from "expo/build/winter/fetch/FetchResponse"
import { fetch, FetchRequestInit } from "expo/fetch"

export interface QuotaInfo {
	used: number;
	total: number;
	percent: number;
	free: number;
	type: string;
	folder: string;
	title: string;
}
export async function makeRequest(
	url: string,
	init?: FetchRequestInit | undefined
): Promise<FetchResponse> {
	return await fetch(url, {
		...init,
		headers: {
			...init?.headers,
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"
		}
	})
}

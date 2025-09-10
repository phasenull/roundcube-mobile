import { FetchResponse } from "expo/build/winter/fetch/FetchResponse";
import { fetch, FetchRequestInit } from "expo/fetch";

export interface SearchResultItem {
	name: string;
	type: string;
	id: string;
	source: string;
	display?: string;
}

export interface SearchResult {
	results: SearchResultItem[];
	query: string;
	timestamp: string;
}

/**
 * Parses search result from Roundcube ksearch_query_results JavaScript call
 * @param text - The JavaScript text containing ksearch_query_results call
 * @returns Parsed search result object or null if parsing fails
 */
export function parseSearchResult(text: string): SearchResult | null {
	try {
		// Extract the ksearch_query_results call with regex
		const searchPattern = /this\.ksearch_query_results\s*\(\s*(\[.*?\])\s*,\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/s;
		const match = text.match(searchPattern);
		
		if (!match) {
			console.warn('No ksearch_query_results call found in text');
			return null;
		}
		
		// Parse the JSON array of search results
		const resultsJson = match[1];
		const query = match[2];
		const timestamp = match[3];
		
		const resultsArray = JSON.parse(resultsJson);
		
		// Validate that it's an array
		if (!Array.isArray(resultsArray)) {
			console.warn('Search results is not an array');
			return null;
		}
		
		// Map and validate each result item
		const results: SearchResultItem[] = resultsArray.map((item: any) => {
			if (!item || typeof item !== 'object') {
				throw new Error('Invalid result item');
			}
			
			
			return {
				name: item.name,
				type: item.type,
				id: item.id,
				source: item.source,
				display: item.display || undefined
			};
		}).filter((e)=>!!e);
		
		return {
			results,
			query,
			timestamp
		};
		
	} catch (error) {
		console.error('Failed to parse search result:', error);
		return null;
	}
}

export interface ComposeFormData {
	task: string;
	locale: string;
	action: string;
	user_id: string;
	compose_id: string;
	session_id: string;
	mailbox: string;
	request_token: string;
	max_filesize: number;
	max_filecount: string;
	attachments: any[];
	signatures: Record<string, { text: string; html: string }>;
	identities: Record<string, { bcc?: string; email: string }>;
	drafts_mailbox: string;
	draft_autosave: number;
	default_font: string;
	default_font_size: string;
	top_posting: boolean;
	sig_below: boolean;
	show_sig: boolean;
	[key: string]: any; // Allow additional properties
}

/**
 * Extracts compose form configuration from HTML text containing rcmail.set_env call
 * @param input - The HTML/text string containing the rcmail.set_env configuration
 * @returns The parsed compose form data or null if not found
 */
export function getComposeFormFromHTML(input: string): ComposeFormData | null {
	try {
		// Pattern to match rcmail.set_env({...}) with the JSON configuration
		const envPattern = /rcmail\.set_env\s*\(\s*({.*?})\s*\);?/s;
		const match = input.match(envPattern);
		
		if (!match || !match[1]) {
			console.warn('No rcmail.set_env call found in HTML');
			return null;
		}
		
		// Parse the JSON configuration
		const configJson = match[1];
		const config = JSON.parse(configJson);
		
		// Validate that essential compose fields exist
		const requiredFields = ['task', 'action', 'request_token'];
		const hasRequiredFields = requiredFields.every(field => field in config);
		
		if (!hasRequiredFields) {
			console.warn('Missing required fields in compose configuration');
			return null;
		}
		
		// Return the parsed configuration with type safety
		return {
			task: config.task || '',
			locale: config.locale || 'en_US',
			action: config.action || '',
			user_id: config.user_id || '',
			compose_id: config.compose_id || '',
			session_id: config.session_id || '',
			mailbox: config.mailbox || 'INBOX',
			request_token: config.request_token || '',
			max_filesize: config.max_filesize || 0,
			max_filecount: config.max_filecount || '0',
			attachments: config.attachments || [],
			signatures: config.signatures || {},
			identities: config.identities || {},
			drafts_mailbox: config.drafts_mailbox || 'Drafts',
			draft_autosave: config.draft_autosave || 300,
			default_font: config.default_font || 'Arial',
			default_font_size: config.default_font_size || '12pt',
			top_posting: config.top_posting || true,
			sig_below: config.sig_below || false,
			show_sig: config.show_sig || true,
			...config // Include all other properties
		};
		
	} catch (error) {
		console.error('Failed to parse compose form from HTML:', error);
		return null;
	}
}

export interface QuotaInfo {
	used: number;
	total: number;
	percent: number;
	free: number;
	type: string;
	folder: string;
	title: string;
}

export interface MessageRow {
	id: number;
	subject: string;
	fromto: string;
	date: string;
	size: string;
	seen: number;
	ctype: string;
	mbox: string;
}

export interface MailboxData {
	pageTitle: string | null;
	unreadCount: {
		mailbox: string;
		count: number;
		hasUnread: boolean;
		folder: string;
	} | null;
	rowCount: {
		text: string;
		mailbox: string;
	} | null;
	columnTypes: string[] | null;
	messages: MessageRow[];
	quota: QuotaInfo | null;
}

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
	// Regex pattern to match both rcmail.set_quota and this.set_quota with their JSON argument
	const quotaPattern = /(rcmail|this)\.set_quota\s*\(\s*({[^}]+})\s*\)/i
	const match = html.match(quotaPattern)
	
	if (!match) {
		return null
	}

	try {
		// Parse the JSON object from the matched string (index 2 because of the capture group)
		const quotaJson = match[2]
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

/**
 * Extracts the page title from HTML
 * @param html - The HTML string to parse
 * @returns The page title or null if not found
 */
export function getPageTitle(html: string): string | null {
	// Regex pattern to match <title> tag content
	const titlePattern = /<title[^>]*>([^<]+)<\/title>/i
	const match = html.match(titlePattern)
	
	if (!match) {
		return null
	}

	// Return the title content, trimmed of whitespace
	return match[1].trim()
}
/**
 * Extracts the page title from HTML (alternative implementation with better handling)
 * @param html - The HTML string to parse
 * @returns The page title or null if not found
 */
export function extractPageTitle(html: string): string | null {
	// Try multiple patterns for title extraction
	const patterns = [
		/<title[^>]*>([^<]+)<\/title>/i,  // Standard title tag
		/<title[^>]*>([\s\S]*?)<\/title>/i,  // Multi-line title
		/<title[^>]*>(.*?)<\/title>/is,  // Case-insensitive with dotall
	]

	for (const pattern of patterns) {
		const match = html.match(pattern)
		if (match && match[1]) {
			const title = match[1].trim()
			// Remove any HTML entities or extra whitespace
			return title.replace(/\s+/g, ' ').replace(/&nbsp;/g, ' ')
		}
	}

	return null
}

/**
 * Parses Roundcube mailbox JavaScript data
 * @param jsText - The JavaScript text containing mailbox data
 * @returns Parsed mailbox data object
 */
export function parseMailboxData(jsText: string): MailboxData {
	const result: MailboxData = {
		pageTitle: null,
		unreadCount: null,
		rowCount: null,
		columnTypes: null,
		messages: [],
		quota: null
	};

	// Parse page title
	const titleMatch = jsText.match(/this\.set_pagetitle\s*\(\s*["']([^"']+)["']\s*\)/);
	if (titleMatch) {
		result.pageTitle = titleMatch[1];
	}

	// Parse unread count
	const unreadMatch = jsText.match(/this\.set_unread_count\s*\(\s*["']([^"']+)["']\s*,\s*(\d+)\s*,\s*(true|false)\s*,\s*["']([^"']*)["']\s*\)/);
	if (unreadMatch) {
		result.unreadCount = {
			mailbox: unreadMatch[1],
			count: parseInt(unreadMatch[2]),
			hasUnread: unreadMatch[3] === 'true',
			folder: unreadMatch[4]
		};
	}

	// Parse row count
	const rowCountMatch = jsText.match(/this\.set_rowcount\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/);
	if (rowCountMatch) {
		result.rowCount = {
			text: rowCountMatch[1],
			mailbox: rowCountMatch[2]
		};
	}

	// Parse column types
	const colTypesMatch = jsText.match(/this\.set_message_coltypes\s*\(\s*\[([^\]]+)\]/);
	if (colTypesMatch) {
		const columnsStr = colTypesMatch[1];
		const columns = columnsStr.match(/["']([^"']+)["']/g);
		if (columns) {
			result.columnTypes = columns.map(col => col.replace(/["']/g, ''));
		}
	}

	// Parse message rows
	const messagePattern = /this\.add_message_row\s*\(\s*(\d+)\s*,\s*({[^}]+})\s*,\s*({[^}]+})\s*,\s*(true|false)\s*\)/g;
	let messageMatch;

	while ((messageMatch = messagePattern.exec(jsText)) !== null) {
		try {
			const id = parseInt(messageMatch[1]);
			const messageData = JSON.parse(messageMatch[2]);
			const flagsData = JSON.parse(messageMatch[3]);

			const message: MessageRow = {
				id,
				subject: messageData.subject || '',
				fromto: parseFromToField(messageData.fromto || ''),
				date: messageData.date || '',
				size: messageData.size || '',
				seen: flagsData.seen || 0,
				ctype: flagsData.ctype || '',
				mbox: flagsData.mbox || ''
			};

			result.messages.push(message);
		} catch (error) {
			console.warn('Failed to parse message row:', error);
		}
	}

	// Parse quota (reuse existing function)
	result.quota = getUsage(jsText);

	return result;
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

export function parseLogoUrl(url?: string): string | undefined {
	if (!url) return;
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url.replace("http://", "https://");
	}
	return `https://${url}`;
}

/**
 * Decodes HTML entities (both named and numeric) to their corresponding characters
 * @param text - The text containing HTML entities
 * @returns The decoded text
 */
export function decodeHtmlEntities(text: string): string {
	// Common named HTML entities
	const namedEntities: { [key: string]: string } = {
		'&nbsp;': ' ',
		'&lt;': '<',
		'&gt;': '>',
		'&amp;': '&',
		'&quot;': '"',
		'&apos;': "'",
		'&cent;': '¢',
		'&pound;': '£',
		'&yen;': '¥',
		'&euro;': '€',
		'&copy;': '©',
		'&reg;': '®',
		'&trade;': '™',
		'&hellip;': '…',
		'&mdash;': '—',
		'&ndash;': '–',
		'&lsquo;': '\u2018',
		'&rsquo;': '\u2019',
		'&ldquo;': '\u201c',
		'&rdquo;': '\u201d',
	};

	// Replace named entities
	let decoded = text;
	for (const [entity, char] of Object.entries(namedEntities)) {
		decoded = decoded.replace(new RegExp(entity, 'gi'), char);
	}

	// Replace numeric entities (&#123; or &#x1F;)
	decoded = decoded.replace(/&#(\d+);/g, (match, num) => {
		return String.fromCharCode(parseInt(num, 10));
	});

	// Replace hexadecimal entities (&#x1F;)
	decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (match, hex) => {
		return String.fromCharCode(parseInt(hex, 16));
	});

	return decoded;
}

/**
 * Extracts the inner text content from a div element with id "messagebody"
 * @param html - The HTML string to parse
 * @returns The inner text content of the messagebody div or null if not found
 */
export function parseMessageBody(html: string): string | null {
	// Regex pattern to match div with id="messagebody" and capture its content
	const messageBodyPattern = /<div[^>]*id\s*=\s*["']messagebody["'][^>]*>([\s\S]*?)<\/div>/i;
	const match = html.match(messageBodyPattern);
	
	if (!match || !match[1]) {
		return null;
	}
	
	let content = match[1];
	
	// Remove HTML tags but preserve line breaks
	content = content
		.replace(/<br\s*\/?>/gi, '\n')           // Convert <br> tags to newlines
		.replace(/<\/p>/gi, '\n\n')             // Convert </p> to double newlines
		.replace(/<p[^>]*>/gi, '')              // Remove <p> opening tags
		.replace(/<[^>]*>/g, '')                // Remove all other HTML tags
		.replace(/\s+\n/g, '\n')                // Remove trailing spaces before newlines
		.replace(/\n\s+/g, '\n')                // Remove leading spaces after newlines
		.replace(/\n{3,}/g, '\n\n')             // Limit consecutive newlines to 2
		.trim();                                // Remove leading/trailing whitespace

	// Decode HTML entities (including numeric ones like &#039;)
	content = decodeHtmlEntities(content);
	
	console.log(content)
	return content || null;
}

/**
 * Extracts email address from HTML span structure in fromto field
 * @param htmlString - The HTML string containing span with title attribute
 * @returns The email address from title attribute or the original string if parsing fails
 */
export function parseFromToField(htmlString: string): string {
	// If it's not HTML (no < or >), return as is
	htmlString = htmlString.toLowerCase()
	if (!htmlString.includes('<') || !htmlString.includes('>')) {
		return htmlString;
	}
	
	// Pattern to match title attribute in span elements
	const titlePattern = /title\s*=\s*["']([^"']+)["']/i;
	const match = htmlString.match(titlePattern);
	
	if (match && match[1]) {
		return match[1];
	}
	
	// If no title found, try to extract text content between span tags
	const textPattern = /<span[^>]*>([^<]+)<\/span>/i;
	const textMatch = htmlString.match(textPattern);
	
	if (textMatch && textMatch[1]) {
		return textMatch[1].trim();
	}
	
	// Fallback: remove all HTML tags and return clean text
	return htmlString.replace(/<[^>]*>/g, '').trim();
}


/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

const BASE_URL = 'https://api.figma.com';
const API_VERSION = 'v1';
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;

export interface IFigmaRequestOptions {
	method: IHttpRequestMethods;
	endpoint: string;
	body?: IDataObject;
	query?: IDataObject;
	returnFullResponse?: boolean;
}

/**
 * Get the access token from credentials based on authentication type
 */
async function getAccessToken(
	context: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
): Promise<string> {
	const credentials = await context.getCredentials('figmaApi');
	
	if (credentials.authenticationType === 'oAuth2') {
		return credentials.oAuthAccessToken as string;
	}
	
	return credentials.accessToken as string;
}

/**
 * Sleep helper for retry delays
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number, baseDelay: number = INITIAL_RETRY_DELAY): number {
	return baseDelay * Math.pow(2, attempt);
}

/**
 * Make an API request to Figma
 */
export async function figmaApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject> {
	const accessToken = await getAccessToken(this);
	
	const options: IRequestOptions = {
		method,
		uri: `${BASE_URL}/${API_VERSION}${endpoint}`,
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json',
		},
		json: true,
	};

	if (body && Object.keys(body).length > 0) {
		options.body = body;
	}

	if (query && Object.keys(query).length > 0) {
		options.qs = query;
	}

	let lastError: Error | undefined;
	
	for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
		try {
			const response = await this.helpers.request(options);
			return response as IDataObject;
		} catch (error) {
			lastError = error as Error;
			const errorObj = error as Record<string, unknown>;
			
			// Check if it's a rate limit error
			if (errorObj.statusCode === 429) {
				const responseObj = errorObj.response as Record<string, unknown> | undefined;
				const headers = responseObj?.headers as Record<string, string> | undefined;
				const retryAfter = headers?.['retry-after'];
				const delay = retryAfter 
					? parseInt(retryAfter, 10) * 1000 
					: getRetryDelay(attempt);
				
				if (attempt < MAX_RETRIES - 1) {
					await sleep(delay);
					continue;
				}
			}
			
			// For other errors, throw immediately
			const errorMessage = typeof errorObj.message === 'string' 
				? errorObj.message 
				: 'Unknown error';
			throw new NodeApiError(this.getNode(), error as JsonObject, {
				message: `Figma API error: ${errorMessage}`,
			});
		}
	}
	
	throw new NodeApiError(this.getNode(), lastError as unknown as JsonObject, {
		message: 'Maximum retry attempts reached for Figma API',
	});
}

/**
 * Make an API request and return all items with pagination
 */
export async function figmaApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	propertyName: string,
	body?: IDataObject,
	query?: IDataObject,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let nextCursor: string | undefined;

	do {
		const qs: IDataObject = { ...query };
		if (nextCursor) {
			qs.cursor = nextCursor;
		}

		const response = await figmaApiRequest.call(this, method, endpoint, body, qs);

		// Extract items from response
		const items = response[propertyName] as IDataObject[] | undefined;
		if (items && Array.isArray(items)) {
			returnData.push(...items);
		}

		// Check for pagination cursor
		const meta = response.meta as IDataObject | undefined;
		if (meta?.cursor) {
			nextCursor = meta.cursor as string;
		} else {
			nextCursor = undefined;
		}
	} while (nextCursor);

	return returnData;
}

/**
 * Validate file key format
 */
export function validateFileKey(fileKey: string): void {
	if (!fileKey || typeof fileKey !== 'string') {
		throw new NodeOperationError(
			{ name: 'Figma' } as never,
			'File key is required and must be a string',
		);
	}
	
	// Figma file keys are typically alphanumeric with some special characters
	const fileKeyPattern = /^[a-zA-Z0-9_-]+$/;
	if (!fileKeyPattern.test(fileKey)) {
		throw new NodeOperationError(
			{ name: 'Figma' } as never,
			'Invalid file key format. File key should contain only alphanumeric characters, underscores, and hyphens.',
		);
	}
}

/**
 * Extract file key from a Figma URL
 */
export function extractFileKeyFromUrl(url: string): string {
	// Match patterns like:
	// https://www.figma.com/file/ABC123/...
	// https://www.figma.com/design/ABC123/...
	const pattern = /figma\.com\/(?:file|design)\/([a-zA-Z0-9_-]+)/;
	const match = url.match(pattern);
	
	if (match && match[1]) {
		return match[1];
	}
	
	throw new NodeOperationError(
		{ name: 'Figma' } as never,
		'Could not extract file key from URL. Please provide a valid Figma file URL.',
	);
}

/**
 * Parse node IDs from comma-separated string
 */
export function parseNodeIds(nodeIds: string): string[] {
	return nodeIds
		.split(',')
		.map((id) => id.trim())
		.filter((id) => id.length > 0);
}

/**
 * Format node IDs for API request
 */
export function formatNodeIdsForApi(nodeIds: string[]): string {
	return nodeIds.join(',');
}

/**
 * Validate export scale
 */
export function validateExportScale(scale: number): void {
	if (scale < 0.01 || scale > 4) {
		throw new NodeOperationError(
			{ name: 'Figma' } as never,
			'Export scale must be between 0.01 and 4',
		);
	}
}

/**
 * Build query parameters for file images export
 */
export function buildImageExportQuery(
	nodeIds: string[],
	format: string,
	scale?: number,
	svgIncludeId?: boolean,
	svgSimplifyStroke?: boolean,
	useAbsoluteBounds?: boolean,
	version?: string,
): IDataObject {
	const query: IDataObject = {
		ids: formatNodeIdsForApi(nodeIds),
		format,
	};

	if (scale !== undefined) {
		validateExportScale(scale);
		query.scale = scale;
	}

	if (format === 'svg') {
		if (svgIncludeId !== undefined) {
			query.svg_include_id = svgIncludeId;
		}
		if (svgSimplifyStroke !== undefined) {
			query.svg_simplify_stroke = svgSimplifyStroke;
		}
	}

	if (useAbsoluteBounds !== undefined) {
		query.use_absolute_bounds = useAbsoluteBounds;
	}

	if (version) {
		query.version = version;
	}

	return query;
}

/**
 * Build client meta for comment positioning
 */
export function buildClientMeta(
	x?: number,
	y?: number,
	nodeId?: string,
	nodeOffsetX?: number,
	nodeOffsetY?: number,
): IDataObject | undefined {
	if (nodeId) {
		const meta: IDataObject = {
			node_id: nodeId,
		};
		
		if (nodeOffsetX !== undefined && nodeOffsetY !== undefined) {
			meta.node_offset = {
				x: nodeOffsetX,
				y: nodeOffsetY,
			};
		}
		
		return meta;
	}
	
	if (x !== undefined && y !== undefined) {
		return { x, y };
	}
	
	return undefined;
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { figmaApiRequest, figmaApiRequestAllItems, validateFileKey } from '../../transport';

export const styleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['style'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'getStyle',
				description: 'Get a style by key',
				action: 'Get a style',
			},
			{
				name: 'Get File Styles',
				value: 'getFileStyles',
				description: 'Get published styles in a file',
				action: 'Get file styles',
			},
			{
				name: 'Get Team Styles',
				value: 'getTeamStyles',
				description: 'Get published styles for a team',
				action: 'Get team styles',
			},
		],
		default: 'getTeamStyles',
	},
];

export const styleFields: INodeProperties[] = [
	// Team ID
	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['style'],
				operation: ['getTeamStyles'],
			},
		},
		description: 'The team\'s unique identifier',
		placeholder: 'e.g., 1234567890',
	},

	// File Key
	{
		displayName: 'File Key',
		name: 'fileKey',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['style'],
				operation: ['getFileStyles'],
			},
		},
		description: 'The file\'s unique identifier',
		placeholder: 'e.g., ABC123xyz',
	},

	// Style Key
	{
		displayName: 'Style Key',
		name: 'key',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['style'],
				operation: ['getStyle'],
			},
		},
		description: 'The style\'s unique key',
	},

	// Return All toggle
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['style'],
				operation: ['getTeamStyles', 'getFileStyles'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},

	// Limit
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				resource: ['style'],
				operation: ['getTeamStyles', 'getFileStyles'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
	},

	// Options for team styles
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['style'],
				operation: ['getTeamStyles'],
			},
		},
		options: [
			{
				displayName: 'After',
				name: 'after',
				type: 'number',
				default: 0,
				description: 'Cursor for pagination - use the cursor from the previous response',
			},
		],
	},
];

export async function executeStyleOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getTeamStyles': {
			const teamId = this.getNodeParameter('teamId', i) as string;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const options = this.getNodeParameter('options', i);

			const query: IDataObject = {};
			if (options.after) {
				query.after = options.after;
			}

			if (returnAll) {
				response = await figmaApiRequestAllItems.call(
					this,
					'GET',
					`/teams/${teamId}/styles`,
					'styles',
					undefined,
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i);
				query.page_size = limit;
				const result = await figmaApiRequest.call(this, 'GET', `/teams/${teamId}/styles`, undefined, query);
				response = (result.meta as IDataObject)?.styles as IDataObject[] || [];
			}
			break;
		}

		case 'getFileStyles': {
			const fileKey = this.getNodeParameter('fileKey', i) as string;
			validateFileKey(fileKey);
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				response = await figmaApiRequestAllItems.call(
					this,
					'GET',
					`/files/${fileKey}/styles`,
					'styles',
				);
			} else {
				const limit = this.getNodeParameter('limit', i);
				const result = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/styles`);
				const meta = result.meta as IDataObject;
				const styles = (meta?.styles as IDataObject[]) || [];
				response = styles.slice(0, limit);
			}
			break;
		}

		case 'getStyle': {
			const key = this.getNodeParameter('key', i) as string;
			response = await figmaApiRequest.call(this, 'GET', `/styles/${key}`);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

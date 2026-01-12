/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { figmaApiRequest, figmaApiRequestAllItems, validateFileKey } from '../../transport';

export const componentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['component'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'getComponent',
				description: 'Get a component by key',
				action: 'Get a component',
			},
			{
				name: 'Get Component Set',
				value: 'getComponentSet',
				description: 'Get a component set by key',
				action: 'Get a component set',
			},
			{
				name: 'Get File Component Sets',
				value: 'getFileComponentSets',
				description: 'Get published component sets in a file',
				action: 'Get file component sets',
			},
			{
				name: 'Get File Components',
				value: 'getFileComponents',
				description: 'Get published components in a file',
				action: 'Get file components',
			},
			{
				name: 'Get Team Component Sets',
				value: 'getTeamComponentSets',
				description: 'Get published component sets for a team',
				action: 'Get team component sets',
			},
			{
				name: 'Get Team Components',
				value: 'getTeamComponents',
				description: 'Get published components for a team',
				action: 'Get team components',
			},
		],
		default: 'getTeamComponents',
	},
];

export const componentFields: INodeProperties[] = [
	// Team ID
	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['component'],
				operation: ['getTeamComponents', 'getTeamComponentSets'],
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
				resource: ['component'],
				operation: ['getFileComponents', 'getFileComponentSets'],
			},
		},
		description: 'The file\'s unique identifier',
		placeholder: 'e.g., ABC123xyz',
	},

	// Component/Set Key
	{
		displayName: 'Component Key',
		name: 'key',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['component'],
				operation: ['getComponent', 'getComponentSet'],
			},
		},
		description: 'The component or component set\'s unique key',
	},

	// Return All toggle
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['component'],
				operation: ['getTeamComponents', 'getFileComponents', 'getTeamComponentSets', 'getFileComponentSets'],
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
				resource: ['component'],
				operation: ['getTeamComponents', 'getFileComponents', 'getTeamComponentSets', 'getFileComponentSets'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
	},

	// Options for team operations
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['component'],
				operation: ['getTeamComponents', 'getTeamComponentSets'],
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

export async function executeComponentOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getTeamComponents': {
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
					`/teams/${teamId}/components`,
					'components',
					undefined,
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i);
				query.page_size = limit;
				const result = await figmaApiRequest.call(this, 'GET', `/teams/${teamId}/components`, undefined, query);
				response = (result.meta as IDataObject)?.components as IDataObject[] || [];
			}
			break;
		}

		case 'getFileComponents': {
			const fileKey = this.getNodeParameter('fileKey', i) as string;
			validateFileKey(fileKey);
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				response = await figmaApiRequestAllItems.call(
					this,
					'GET',
					`/files/${fileKey}/components`,
					'components',
				);
			} else {
				const limit = this.getNodeParameter('limit', i);
				const result = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/components`);
				const meta = result.meta as IDataObject;
				const components = (meta?.components as IDataObject[]) || [];
				response = components.slice(0, limit);
			}
			break;
		}

		case 'getComponent': {
			const key = this.getNodeParameter('key', i) as string;
			response = await figmaApiRequest.call(this, 'GET', `/components/${key}`);
			break;
		}

		case 'getTeamComponentSets': {
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
					`/teams/${teamId}/component_sets`,
					'component_sets',
					undefined,
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i);
				query.page_size = limit;
				const result = await figmaApiRequest.call(this, 'GET', `/teams/${teamId}/component_sets`, undefined, query);
				response = (result.meta as IDataObject)?.component_sets as IDataObject[] || [];
			}
			break;
		}

		case 'getFileComponentSets': {
			const fileKey = this.getNodeParameter('fileKey', i) as string;
			validateFileKey(fileKey);
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				response = await figmaApiRequestAllItems.call(
					this,
					'GET',
					`/files/${fileKey}/component_sets`,
					'component_sets',
				);
			} else {
				const limit = this.getNodeParameter('limit', i);
				const result = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/component_sets`);
				const meta = result.meta as IDataObject;
				const componentSets = (meta?.component_sets as IDataObject[]) || [];
				response = componentSets.slice(0, limit);
			}
			break;
		}

		case 'getComponentSet': {
			const key = this.getNodeParameter('key', i) as string;
			response = await figmaApiRequest.call(this, 'GET', `/component_sets/${key}`);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

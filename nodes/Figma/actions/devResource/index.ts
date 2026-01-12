/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { figmaApiRequest, validateFileKey } from '../../transport';

export const devResourceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['devResource'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'createDevResource',
				description: 'Create a dev resource link',
				action: 'Create a dev resource',
			},
			{
				name: 'Delete',
				value: 'deleteDevResource',
				description: 'Delete a dev resource',
				action: 'Delete a dev resource',
			},
			{
				name: 'Get Many',
				value: 'getDevResources',
				description: 'Get dev resources in a file',
				action: 'Get dev resources',
			},
			{
				name: 'Update',
				value: 'updateDevResource',
				description: 'Update a dev resource',
				action: 'Update a dev resource',
			},
		],
		default: 'getDevResources',
	},
];

export const devResourceFields: INodeProperties[] = [
	// File Key - common to all operations
	{
		displayName: 'File Key',
		name: 'fileKey',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['devResource'],
			},
		},
		description: 'The file\'s unique identifier',
		placeholder: 'e.g., ABC123xyz',
	},

	// Dev Resource ID - for update and delete
	{
		displayName: 'Dev Resource ID',
		name: 'devResourceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['devResource'],
				operation: ['updateDevResource', 'deleteDevResource'],
			},
		},
		description: 'The unique identifier of the dev resource',
	},

	// Create fields
	{
		displayName: 'Node ID',
		name: 'nodeId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['devResource'],
				operation: ['createDevResource'],
			},
		},
		description: 'The node ID to attach the dev resource to',
		placeholder: 'e.g., 1:2',
	},
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['devResource'],
				operation: ['createDevResource'],
			},
		},
		description: 'The URL of the dev resource',
		placeholder: 'e.g., https://github.com/...',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['devResource'],
				operation: ['createDevResource'],
			},
		},
		description: 'The display name of the dev resource',
	},

	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['devResource'],
				operation: ['updateDevResource'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New display name for the dev resource',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'New URL for the dev resource',
			},
		],
	},

	// Get options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['devResource'],
				operation: ['getDevResources'],
			},
		},
		options: [
			{
				displayName: 'Node IDs',
				name: 'nodeIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of node IDs to filter dev resources by',
				placeholder: 'e.g., 1:2, 3:4',
			},
		],
	},
];

export async function executeDevResourceOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const fileKey = this.getNodeParameter('fileKey', i) as string;
	validateFileKey(fileKey);

	let response: IDataObject;

	switch (operation) {
		case 'getDevResources': {
			const options = this.getNodeParameter('options', i);
			const query: IDataObject = {};

			if (options.nodeIds) {
				query.node_ids = (options.nodeIds as string).split(',').map(id => id.trim()).join(',');
			}

			response = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/dev_resources`, undefined, query);
			
			// Return the dev_resources array if available
			if (response.dev_resources && Array.isArray(response.dev_resources)) {
				return response.dev_resources as IDataObject[];
			}
			break;
		}

		case 'createDevResource': {
			const nodeId = this.getNodeParameter('nodeId', i) as string;
			const url = this.getNodeParameter('url', i) as string;
			const name = this.getNodeParameter('name', i) as string;

			const body: IDataObject = {
				dev_resources: [
					{
						node_id: nodeId,
						url,
						name,
					},
				],
			};

			response = await figmaApiRequest.call(this, 'POST', `/files/${fileKey}/dev_resources`, body);
			break;
		}

		case 'updateDevResource': {
			const devResourceId = this.getNodeParameter('devResourceId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i);

			const devResourceUpdate: IDataObject = {
				id: devResourceId,
			};

			if (updateFields.name) {
				devResourceUpdate.name = updateFields.name;
			}
			if (updateFields.url) {
				devResourceUpdate.url = updateFields.url;
			}

			const body: IDataObject = {
				dev_resources: [devResourceUpdate],
			};

			response = await figmaApiRequest.call(this, 'PUT', `/files/${fileKey}/dev_resources`, body);
			break;
		}

		case 'deleteDevResource': {
			const devResourceId = this.getNodeParameter('devResourceId', i) as string;
			response = await figmaApiRequest.call(this, 'DELETE', `/files/${fileKey}/dev_resources/${devResourceId}`);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { figmaApiRequest, figmaApiRequestAllItems, validateFileKey } from '../../transport';

export const versionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['version'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getVersions',
				description: 'Get version history of a file',
				action: 'Get file versions',
			},
			{
				name: 'Get Named Versions',
				value: 'getNamedVersions',
				description: 'Get only named versions of a file',
				action: 'Get named file versions',
			},
		],
		default: 'getVersions',
	},
];

export const versionFields: INodeProperties[] = [
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
				resource: ['version'],
			},
		},
		description: 'The file\'s unique identifier',
		placeholder: 'e.g., ABC123xyz',
	},

	// Return All toggle
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['version'],
				operation: ['getVersions', 'getNamedVersions'],
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
				resource: ['version'],
				operation: ['getVersions', 'getNamedVersions'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
	},

	// Options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['version'],
				operation: ['getVersions', 'getNamedVersions'],
			},
		},
		options: [
			{
				displayName: 'Before',
				name: 'before',
				type: 'string',
				default: '',
				description: 'Pagination cursor to fetch versions before',
			},
		],
	},
];

export async function executeVersionOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const fileKey = this.getNodeParameter('fileKey', i) as string;
	validateFileKey(fileKey);

	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i);

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getVersions': {
			const query: IDataObject = {};

			if (!returnAll) {
				const limit = this.getNodeParameter('limit', i);
				query.page_size = limit;
			}

			if (options.before) {
				query.before = options.before;
			}

			if (returnAll) {
				response = await figmaApiRequestAllItems.call(
					this,
					'GET',
					`/files/${fileKey}/versions`,
					'versions',
					undefined,
					query,
				);
			} else {
				const result = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/versions`, undefined, query);
				response = (result.versions as IDataObject[]) || result;
			}
			break;
		}

		case 'getNamedVersions': {
			const query: IDataObject = {};

			if (!returnAll) {
				const limit = this.getNodeParameter('limit', i);
				query.page_size = limit;
			}

			if (options.before) {
				query.before = options.before;
			}

			if (returnAll) {
				const allVersions = await figmaApiRequestAllItems.call(
					this,
					'GET',
					`/files/${fileKey}/versions`,
					'versions',
					undefined,
					query,
				);
				// Filter to only named versions (those with labels)
				response = allVersions.filter((v: IDataObject) => v.label && (v.label as string).trim() !== '');
			} else {
				const result = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/versions`, undefined, query);
				const versions = (result.versions as IDataObject[]) || [];
				// Filter to only named versions
				response = versions.filter((v: IDataObject) => v.label && (v.label as string).trim() !== '');
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

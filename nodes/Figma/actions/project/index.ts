/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { figmaApiRequest, figmaApiRequestAllItems } from '../../transport';

export const projectOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['project'],
			},
		},
		options: [
			{
				name: 'Get Files',
				value: 'getFiles',
				description: 'Get files in a project',
				action: 'Get files in a project',
			},
			{
				name: 'Get Projects',
				value: 'getProjects',
				description: 'Get all projects for a team',
				action: 'Get team projects',
			},
		],
		default: 'getProjects',
	},
];

export const projectFields: INodeProperties[] = [
	// Team ID - for getProjects
	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['getProjects'],
			},
		},
		description: 'The team\'s unique identifier. Can be found in the team URL.',
		placeholder: 'e.g., 1234567890',
	},

	// Project ID - for getFiles
	{
		displayName: 'Project ID',
		name: 'projectId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['getFiles'],
			},
		},
		description: 'The project\'s unique identifier',
		placeholder: 'e.g., 1234567890',
	},

	// Return All toggle
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['project'],
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
				resource: ['project'],
				returnAll: [false],
			},
		},
		description: 'Max number of results to return',
		typeOptions: {
			minValue: 1,
		},
	},

	// Options for getFiles
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['project'],
				operation: ['getFiles'],
			},
		},
		options: [
			{
				displayName: 'Branch Data',
				name: 'branchData',
				type: 'boolean',
				default: false,
				description: 'Whether to include branch metadata in the response',
			},
		],
	},
];

export async function executeProjectOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;

	let response: IDataObject | IDataObject[];

	switch (operation) {
		case 'getProjects': {
			const teamId = this.getNodeParameter('teamId', i) as string;

			if (returnAll) {
				response = await figmaApiRequestAllItems.call(
					this,
					'GET',
					`/teams/${teamId}/projects`,
					'projects',
				);
			} else {
				const limit = this.getNodeParameter('limit', i);
				const result = await figmaApiRequest.call(this, 'GET', `/teams/${teamId}/projects`);
				const projects = (result.projects as IDataObject[]) || [];
				response = projects.slice(0, limit);
			}
			break;
		}

		case 'getFiles': {
			const projectId = this.getNodeParameter('projectId', i) as string;
			const options = this.getNodeParameter('options', i);

			const query: IDataObject = {};
			if (options.branchData) {
				query.branch_data = options.branchData;
			}

			if (returnAll) {
				response = await figmaApiRequestAllItems.call(
					this,
					'GET',
					`/projects/${projectId}/files`,
					'files',
					undefined,
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i);
				const result = await figmaApiRequest.call(this, 'GET', `/projects/${projectId}/files`, undefined, query);
				const files = (result.files as IDataObject[]) || [];
				response = files.slice(0, limit);
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { figmaApiRequest, validateFileKey } from '../../transport';

export const variableOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['variable'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'createVariables',
				description: 'Create new variables in a file',
				action: 'Create variables',
			},
			{
				name: 'Delete',
				value: 'deleteVariables',
				description: 'Delete variables from a file',
				action: 'Delete variables',
			},
			{
				name: 'Get Local Variables',
				value: 'getLocalVariables',
				description: 'Get local variables in a file',
				action: 'Get local variables',
			},
			{
				name: 'Get Published Variables',
				value: 'getPublishedVariables',
				description: 'Get published variables in a file',
				action: 'Get published variables',
			},
			{
				name: 'Update',
				value: 'updateVariables',
				description: 'Update existing variables in a file',
				action: 'Update variables',
			},
		],
		default: 'getLocalVariables',
	},
];

export const variableFields: INodeProperties[] = [
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
				resource: ['variable'],
			},
		},
		description: 'The file\'s unique identifier',
		placeholder: 'e.g., ABC123xyz',
	},

	// Create Variables fields
	{
		displayName: 'Variable Collection ID',
		name: 'variableCollectionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['variable'],
				operation: ['createVariables'],
			},
		},
		description: 'The ID of the variable collection to add variables to',
	},
	{
		displayName: 'Variables',
		name: 'variables',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['variable'],
				operation: ['createVariables'],
			},
		},
		default: {},
		options: [
			{
				name: 'variableValues',
				displayName: 'Variable',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the variable',
					},
					{
						displayName: 'Resolved Type',
						name: 'resolvedType',
						type: 'options',
						options: [
							{
								name: 'Boolean',
								value: 'BOOLEAN',
							},
							{
								name: 'Color',
								value: 'COLOR',
							},
							{
								name: 'Float',
								value: 'FLOAT',
							},
							{
								name: 'String',
								value: 'STRING',
							},
						],
						default: 'STRING',
						description: 'The resolved type of the variable',
					},
					{
						displayName: 'Value (JSON)',
						name: 'value',
						type: 'json',
						default: '{}',
						description: 'The value of the variable as JSON. For colors, use {"r": 0-1, "g": 0-1, "b": 0-1, "a": 0-1}.',
					},
				],
			},
		],
	},

	// Update Variables fields
	{
		displayName: 'Variable Updates',
		name: 'variableUpdates',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['variable'],
				operation: ['updateVariables'],
			},
		},
		default: {},
		options: [
			{
				name: 'updateValues',
				displayName: 'Variable Update',
				values: [
					{
						displayName: 'Variable ID',
						name: 'variableId',
						type: 'string',
						default: '',
						description: 'ID of the variable to update',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'New name for the variable (optional)',
					},
					{
						displayName: 'Mode ID',
						name: 'modeId',
						type: 'string',
						default: '',
						description: 'The mode ID to update the value for',
					},
					{
						displayName: 'Value (JSON)',
						name: 'value',
						type: 'json',
						default: '{}',
						description: 'New value for the variable as JSON',
					},
				],
			},
		],
	},

	// Delete Variables fields
	{
		displayName: 'Variable IDs',
		name: 'variableIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['variable'],
				operation: ['deleteVariables'],
			},
		},
		description: 'Comma-separated list of variable IDs to delete',
		placeholder: 'e.g., VariableID:123, VariableID:456',
	},
];

export async function executeVariableOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const fileKey = this.getNodeParameter('fileKey', i) as string;
	validateFileKey(fileKey);

	let response: IDataObject;

	switch (operation) {
		case 'getLocalVariables': {
			response = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/variables/local`);
			break;
		}

		case 'getPublishedVariables': {
			response = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/variables/published`);
			break;
		}

		case 'createVariables': {
			const variableCollectionId = this.getNodeParameter('variableCollectionId', i) as string;
			const variablesData = this.getNodeParameter('variables', i) as IDataObject;
			const variableValues = (variablesData.variableValues as IDataObject[]) || [];

			const variables: IDataObject[] = [];

			for (const variable of variableValues) {
				let value: unknown;
				try {
					value = typeof variable.value === 'string' 
						? JSON.parse(variable.value) 
						: variable.value;
				} catch {
					value = variable.value;
				}

				variables.push({
					name: variable.name,
					resolvedType: variable.resolvedType,
					variableCollectionId,
					initialValue: value as IDataObject,
				});
			}

			const body: IDataObject = {
				variables,
			};

			response = await figmaApiRequest.call(this, 'POST', `/files/${fileKey}/variables`, body);
			break;
		}

		case 'updateVariables': {
			const updatesData = this.getNodeParameter('variableUpdates', i) as IDataObject;
			const updateValues = (updatesData.updateValues as IDataObject[]) || [];

			const variableUpdates: IDataObject[] = [];
			const variableModeValues: IDataObject[] = [];

			for (const update of updateValues) {
				// If name is provided, add to variable updates
				if (update.name) {
					variableUpdates.push({
						id: update.variableId,
						name: update.name,
					});
				}

				// If modeId and value are provided, add to mode values
				if (update.modeId && update.value) {
					let value: unknown;
					try {
						value = typeof update.value === 'string' 
							? JSON.parse(update.value) 
							: update.value;
					} catch {
						value = update.value;
					}

					variableModeValues.push({
						variableId: update.variableId,
						modeId: update.modeId,
						value: value as IDataObject,
					});
				}
			}

			const body: IDataObject = {};
			if (variableUpdates.length > 0) {
				body.variables = variableUpdates;
			}
			if (variableModeValues.length > 0) {
				body.variableModeValues = variableModeValues;
			}

			response = await figmaApiRequest.call(this, 'POST', `/files/${fileKey}/variables`, body);
			break;
		}

		case 'deleteVariables': {
			const variableIdsString = this.getNodeParameter('variableIds', i) as string;
			const variableIds = variableIdsString.split(',').map(id => id.trim()).filter(id => id);

			const body: IDataObject = {
				variables: variableIds.map(id => ({
					action: 'DELETE',
					id,
				})),
			};

			response = await figmaApiRequest.call(this, 'POST', `/files/${fileKey}/variables`, body);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

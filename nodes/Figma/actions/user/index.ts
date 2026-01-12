/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { figmaApiRequest } from '../../transport';

export const userOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Get Me',
				value: 'getMe',
				description: 'Get the currently authenticated user',
				action: 'Get current user',
			},
		],
		default: 'getMe',
	},
];

export const userFields: INodeProperties[] = [
	// No additional fields needed for getMe operation
];

export async function executeUserOperation(
	this: IExecuteFunctions,
	operation: string,
	_i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject;

	switch (operation) {
		case 'getMe': {
			response = await figmaApiRequest.call(this, 'GET', '/me');
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

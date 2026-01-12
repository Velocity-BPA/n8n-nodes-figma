/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { figmaApiRequest } from '../../transport';

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'createWebhook',
				description: 'Create a new webhook',
				action: 'Create a webhook',
			},
			{
				name: 'Delete',
				value: 'deleteWebhook',
				description: 'Delete a webhook',
				action: 'Delete a webhook',
			},
			{
				name: 'Get',
				value: 'getWebhook',
				description: 'Get a webhook by ID',
				action: 'Get a webhook',
			},
			{
				name: 'Get Many',
				value: 'getTeamWebhooks',
				description: 'Get webhooks for a team',
				action: 'Get team webhooks',
			},
			{
				name: 'Update',
				value: 'updateWebhook',
				description: 'Update a webhook',
				action: 'Update a webhook',
			},
		],
		default: 'getTeamWebhooks',
	},
];

export const webhookFields: INodeProperties[] = [
	// Team ID
	{
		displayName: 'Team ID',
		name: 'teamId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getTeamWebhooks', 'createWebhook'],
			},
		},
		description: 'The team\'s unique identifier',
		placeholder: 'e.g., 1234567890',
	},

	// Webhook ID
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['getWebhook', 'updateWebhook', 'deleteWebhook'],
			},
		},
		description: 'The webhook\'s unique identifier',
	},

	// Create fields
	{
		displayName: 'Event Type',
		name: 'eventType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['createWebhook'],
			},
		},
		options: [
			{
				name: 'File Comment',
				value: 'FILE_COMMENT',
			},
			{
				name: 'File Delete',
				value: 'FILE_DELETE',
			},
			{
				name: 'File Update',
				value: 'FILE_UPDATE',
			},
			{
				name: 'File Version Update',
				value: 'FILE_VERSION_UPDATE',
			},
			{
				name: 'Library Publish',
				value: 'LIBRARY_PUBLISH',
			},
			{
				name: 'Ping',
				value: 'PING',
			},
		],
		default: 'FILE_UPDATE',
		description: 'The event type that triggers the webhook',
	},
	{
		displayName: 'Endpoint URL',
		name: 'endpoint',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['createWebhook'],
			},
		},
		description: 'The URL that will receive webhook payloads',
		placeholder: 'https://your-server.com/webhook',
	},
	{
		displayName: 'Passcode',
		name: 'passcode',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['createWebhook'],
			},
		},
		description: 'A passcode for webhook verification. This will be included in webhook payloads.',
		typeOptions: {
			password: true,
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['createWebhook'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'A description for the webhook',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 'ACTIVE',
					},
					{
						name: 'Paused',
						value: 'PAUSED',
					},
				],
				default: 'ACTIVE',
				description: 'The status of the webhook',
			},
		],
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
				resource: ['webhook'],
				operation: ['updateWebhook'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'New description for the webhook',
			},
			{
				displayName: 'Endpoint URL',
				name: 'endpoint',
				type: 'string',
				default: '',
				description: 'New endpoint URL for the webhook',
			},
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				options: [
					{
						name: 'File Comment',
						value: 'FILE_COMMENT',
					},
					{
						name: 'File Delete',
						value: 'FILE_DELETE',
					},
					{
						name: 'File Update',
						value: 'FILE_UPDATE',
					},
					{
						name: 'File Version Update',
						value: 'FILE_VERSION_UPDATE',
					},
					{
						name: 'Library Publish',
						value: 'LIBRARY_PUBLISH',
					},
					{
						name: 'Ping',
						value: 'PING',
					},
				],
				default: 'FILE_UPDATE',
				description: 'New event type for the webhook',
			},
			{
				displayName: 'Passcode',
				name: 'passcode',
				type: 'string',
				default: '',
				description: 'New passcode for the webhook',
				typeOptions: {
					password: true,
				},
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{
						name: 'Active',
						value: 'ACTIVE',
					},
					{
						name: 'Paused',
						value: 'PAUSED',
					},
				],
				default: 'ACTIVE',
				description: 'New status for the webhook',
			},
		],
	},
];

export async function executeWebhookOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let response: IDataObject;

	switch (operation) {
		case 'getTeamWebhooks': {
			const teamId = this.getNodeParameter('teamId', i) as string;
			response = await figmaApiRequest.call(this, 'GET', `/teams/${teamId}/webhooks`);
			
			// Return webhooks array if available
			if (response.webhooks && Array.isArray(response.webhooks)) {
				return response.webhooks as IDataObject[];
			}
			break;
		}

		case 'createWebhook': {
			const teamId = this.getNodeParameter('teamId', i) as string;
			const eventType = this.getNodeParameter('eventType', i) as string;
			const endpoint = this.getNodeParameter('endpoint', i) as string;
			const passcode = this.getNodeParameter('passcode', i) as string;
			const options = this.getNodeParameter('options', i);

			const body: IDataObject = {
				event_type: eventType,
				team_id: teamId,
				endpoint,
				passcode,
			};

			if (options.description) {
				body.description = options.description;
			}
			if (options.status) {
				body.status = options.status;
			}

			response = await figmaApiRequest.call(this, 'POST', '/webhooks', body);
			break;
		}

		case 'getWebhook': {
			const webhookId = this.getNodeParameter('webhookId', i) as string;
			response = await figmaApiRequest.call(this, 'GET', `/webhooks/${webhookId}`);
			break;
		}

		case 'updateWebhook': {
			const webhookId = this.getNodeParameter('webhookId', i) as string;
			const updateFields = this.getNodeParameter('updateFields', i);

			const body: IDataObject = {};

			if (updateFields.eventType) {
				body.event_type = updateFields.eventType;
			}
			if (updateFields.endpoint) {
				body.endpoint = updateFields.endpoint;
			}
			if (updateFields.passcode) {
				body.passcode = updateFields.passcode;
			}
			if (updateFields.status) {
				body.status = updateFields.status;
			}
			if (updateFields.description !== undefined) {
				body.description = updateFields.description;
			}

			response = await figmaApiRequest.call(this, 'PUT', `/webhooks/${webhookId}`, body);
			break;
		}

		case 'deleteWebhook': {
			const webhookId = this.getNodeParameter('webhookId', i) as string;
			response = await figmaApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

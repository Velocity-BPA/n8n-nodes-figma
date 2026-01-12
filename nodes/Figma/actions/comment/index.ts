/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { figmaApiRequest, validateFileKey, buildClientMeta } from '../../transport';

export const commentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['comment'],
			},
		},
		options: [
			{
				name: 'Add Reaction',
				value: 'addReaction',
				description: 'Add a reaction to a comment',
				action: 'Add reaction to a comment',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Post a new comment on a file',
				action: 'Create a comment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a comment',
				action: 'Delete a comment',
			},
			{
				name: 'Delete Reaction',
				value: 'deleteReaction',
				description: 'Remove a reaction from a comment',
				action: 'Delete reaction from a comment',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many comments on a file',
				action: 'Get many comments',
			},
			{
				name: 'Get Reactions',
				value: 'getReactions',
				description: 'Get reactions on a comment',
				action: 'Get reactions on a comment',
			},
		],
		default: 'getAll',
	},
];

export const commentFields: INodeProperties[] = [
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
				resource: ['comment'],
			},
		},
		description: 'The file\'s unique identifier',
		placeholder: 'e.g., ABC123xyz',
	},

	// Comment ID - for operations that need it
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['delete', 'getReactions', 'addReaction', 'deleteReaction'],
			},
		},
		description: 'The unique identifier of the comment',
	},

	// Create operation fields
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['create'],
			},
		},
		description: 'The text content of the comment',
		typeOptions: {
			rows: 4,
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
				resource: ['comment'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Comment ID (Reply To)',
				name: 'commentId',
				type: 'string',
				default: '',
				description: 'The comment ID to reply to. If specified, creates a reply to that comment.',
			},
			{
				displayName: 'Node ID',
				name: 'nodeId',
				type: 'string',
				default: '',
				description: 'The node ID to attach the comment to',
			},
			{
				displayName: 'Node Offset X',
				name: 'nodeOffsetX',
				type: 'number',
				default: 0,
				description: 'X offset relative to the node (requires Node ID)',
			},
			{
				displayName: 'Node Offset Y',
				name: 'nodeOffsetY',
				type: 'number',
				default: 0,
				description: 'Y offset relative to the node (requires Node ID)',
			},
			{
				displayName: 'Position X',
				name: 'x',
				type: 'number',
				default: 0,
				description: 'Absolute X position of the comment',
			},
			{
				displayName: 'Position Y',
				name: 'y',
				type: 'number',
				default: 0,
				description: 'Absolute Y position of the comment',
			},
		],
	},

	// Get All operation options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'As Markdown',
				name: 'asMd',
				type: 'boolean',
				default: false,
				description: 'Whether to return comments as markdown',
			},
		],
	},

	// Reaction emoji for add/delete reaction
	{
		displayName: 'Emoji',
		name: 'emoji',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['addReaction', 'deleteReaction'],
			},
		},
		description: 'The emoji shortcode for the reaction (e.g., ":heart:", ":+1:", ":eyes:")',
		placeholder: 'e.g., :heart:',
	},

	// Get Reactions options
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['comment'],
				operation: ['getReactions'],
			},
		},
		options: [
			{
				displayName: 'Cursor',
				name: 'cursor',
				type: 'string',
				default: '',
				description: 'Pagination cursor for fetching more results',
			},
		],
	},
];

export async function executeCommentOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const fileKey = this.getNodeParameter('fileKey', i) as string;
	validateFileKey(fileKey);

	let response: IDataObject;

	switch (operation) {
		case 'getAll': {
			const options = this.getNodeParameter('options', i);
			const query: IDataObject = {};

			if (options.asMd) {
				query.as_md = options.asMd;
			}

			response = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/comments`, undefined, query);
			
			// Return just the comments array if available
			if (response.comments && Array.isArray(response.comments)) {
				return response.comments as IDataObject[];
			}
			break;
		}

		case 'create': {
			const message = this.getNodeParameter('message', i) as string;
			const options = this.getNodeParameter('options', i);

			const body: IDataObject = {
				message,
			};

			// Handle reply to existing comment
			if (options.commentId) {
				body.comment_id = options.commentId;
			}

			// Handle positioning
			const clientMeta = buildClientMeta(
				options.x as number | undefined,
				options.y as number | undefined,
				options.nodeId as string | undefined,
				options.nodeOffsetX as number | undefined,
				options.nodeOffsetY as number | undefined,
			);

			if (clientMeta) {
				body.client_meta = clientMeta;
			}

			response = await figmaApiRequest.call(this, 'POST', `/files/${fileKey}/comments`, body);
			break;
		}

		case 'delete': {
			const commentId = this.getNodeParameter('commentId', i) as string;
			response = await figmaApiRequest.call(this, 'DELETE', `/files/${fileKey}/comments/${commentId}`);
			break;
		}

		case 'getReactions': {
			const commentId = this.getNodeParameter('commentId', i) as string;
			const options = this.getNodeParameter('options', i);
			const query: IDataObject = {};

			if (options.cursor) {
				query.cursor = options.cursor;
			}

			response = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/comments/${commentId}/reactions`, undefined, query);
			break;
		}

		case 'addReaction': {
			const commentId = this.getNodeParameter('commentId', i) as string;
			const emoji = this.getNodeParameter('emoji', i) as string;

			const body: IDataObject = {
				emoji,
			};

			response = await figmaApiRequest.call(this, 'POST', `/files/${fileKey}/comments/${commentId}/reactions`, body);
			break;
		}

		case 'deleteReaction': {
			const commentId = this.getNodeParameter('commentId', i) as string;
			const emoji = this.getNodeParameter('emoji', i) as string;

			const query: IDataObject = {
				emoji,
			};

			response = await figmaApiRequest.call(this, 'DELETE', `/files/${fileKey}/comments/${commentId}/reactions`, undefined, query);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

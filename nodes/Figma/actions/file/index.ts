/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import {
	figmaApiRequest,
	validateFileKey,
	parseNodeIds,
	buildImageExportQuery,
} from '../../transport';

export const fileOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['file'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a file by key',
				action: 'Get a file',
			},
			{
				name: 'Get Image Fills',
				value: 'getImageFills',
				description: 'Get URLs for images in a file',
				action: 'Get image fills from a file',
			},
			{
				name: 'Get Images',
				value: 'getImages',
				description: 'Export images from a file',
				action: 'Export images from a file',
			},
			{
				name: 'Get Nodes',
				value: 'getNodes',
				description: 'Get specific nodes from a file',
				action: 'Get nodes from a file',
			},
		],
		default: 'get',
	},
];

export const fileFields: INodeProperties[] = [
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
				resource: ['file'],
			},
		},
		description: 'The file\'s unique identifier. Can be found in the Figma file URL after "/file/" or "/design/".',
		placeholder: 'e.g., ABC123xyz',
	},

	// Get operation fields
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['get'],
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
			{
				displayName: 'Depth',
				name: 'depth',
				type: 'number',
				default: 0,
				description: 'Depth of node tree traversal. Set to a positive integer to limit the depth. Use 0 for unlimited depth.',
				typeOptions: {
					minValue: 0,
				},
			},
			{
				displayName: 'Geometry',
				name: 'geometry',
				type: 'options',
				options: [
					{
						name: 'None',
						value: '',
					},
					{
						name: 'Paths',
						value: 'paths',
					},
				],
				default: '',
				description: 'Include vector path data in the response',
			},
			{
				displayName: 'Plugin Data',
				name: 'pluginData',
				type: 'string',
				default: '',
				description: 'Comma-separated list of plugin IDs to include plugin data for',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'string',
				default: '',
				description: 'Specific file version ID to retrieve',
			},
		],
	},

	// Get Nodes operation fields
	{
		displayName: 'Node IDs',
		name: 'nodeIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getNodes'],
			},
		},
		description: 'Comma-separated list of node IDs to retrieve',
		placeholder: 'e.g., 1:2, 3:4, 5:6',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getNodes'],
			},
		},
		options: [
			{
				displayName: 'Depth',
				name: 'depth',
				type: 'number',
				default: 0,
				description: 'Depth of node tree traversal. Set to a positive integer to limit the depth.',
				typeOptions: {
					minValue: 0,
				},
			},
			{
				displayName: 'Geometry',
				name: 'geometry',
				type: 'options',
				options: [
					{
						name: 'None',
						value: '',
					},
					{
						name: 'Paths',
						value: 'paths',
					},
				],
				default: '',
				description: 'Include vector path data in the response',
			},
			{
				displayName: 'Plugin Data',
				name: 'pluginData',
				type: 'string',
				default: '',
				description: 'Comma-separated list of plugin IDs to include plugin data for',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'string',
				default: '',
				description: 'Specific file version ID to retrieve',
			},
		],
	},

	// Get Images operation fields
	{
		displayName: 'Node IDs',
		name: 'nodeIds',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getImages'],
			},
		},
		description: 'Comma-separated list of node IDs to export as images',
		placeholder: 'e.g., 1:2, 3:4, 5:6',
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getImages'],
			},
		},
		options: [
			{
				name: 'JPG',
				value: 'jpg',
			},
			{
				name: 'PDF',
				value: 'pdf',
			},
			{
				name: 'PNG',
				value: 'png',
			},
			{
				name: 'SVG',
				value: 'svg',
			},
		],
		default: 'png',
		description: 'Image export format',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getImages'],
			},
		},
		options: [
			{
				displayName: 'Scale',
				name: 'scale',
				type: 'number',
				default: 1,
				description: 'Image scale factor (0.01 to 4)',
				typeOptions: {
					minValue: 0.01,
					maxValue: 4,
					numberPrecision: 2,
				},
			},
			{
				displayName: 'SVG Include ID',
				name: 'svgIncludeId',
				type: 'boolean',
				default: false,
				description: 'Whether to include node ID attributes in SVG output',
				displayOptions: {
					show: {
						'/format': ['svg'],
					},
				},
			},
			{
				displayName: 'SVG Simplify Stroke',
				name: 'svgSimplifyStroke',
				type: 'boolean',
				default: true,
				description: 'Whether to simplify strokes in SVG output',
				displayOptions: {
					show: {
						'/format': ['svg'],
					},
				},
			},
			{
				displayName: 'Use Absolute Bounds',
				name: 'useAbsoluteBounds',
				type: 'boolean',
				default: false,
				description: 'Whether to use absolute bounds for rendering',
			},
			{
				displayName: 'Version',
				name: 'version',
				type: 'string',
				default: '',
				description: 'Specific file version ID to export from',
			},
		],
	},

	// Get Image Fills operation fields
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['file'],
				operation: ['getImageFills'],
			},
		},
		options: [
			{
				displayName: 'Version',
				name: 'version',
				type: 'string',
				default: '',
				description: 'Specific file version ID',
			},
		],
	},
];

export async function executeFileOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	const fileKey = this.getNodeParameter('fileKey', i) as string;
	validateFileKey(fileKey);

	let response: IDataObject;

	switch (operation) {
		case 'get': {
			const options = this.getNodeParameter('options', i);
			const query: IDataObject = {};

			if (options.version) {
				query.version = options.version;
			}
			if (options.depth) {
				query.depth = options.depth;
			}
			if (options.geometry) {
				query.geometry = options.geometry;
			}
			if (options.pluginData) {
				query.plugin_data = options.pluginData;
			}
			if (options.branchData) {
				query.branch_data = options.branchData;
			}

			response = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}`, undefined, query);
			break;
		}

		case 'getNodes': {
			const nodeIds = this.getNodeParameter('nodeIds', i) as string;
			const options = this.getNodeParameter('options', i);
			const parsedNodeIds = parseNodeIds(nodeIds);

			const query: IDataObject = {
				ids: parsedNodeIds.join(','),
			};

			if (options.version) {
				query.version = options.version;
			}
			if (options.depth) {
				query.depth = options.depth;
			}
			if (options.geometry) {
				query.geometry = options.geometry;
			}
			if (options.pluginData) {
				query.plugin_data = options.pluginData;
			}

			response = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/nodes`, undefined, query);
			break;
		}

		case 'getImages': {
			const nodeIds = this.getNodeParameter('nodeIds', i) as string;
			const format = this.getNodeParameter('format', i) as string;
			const options = this.getNodeParameter('options', i);
			const parsedNodeIds = parseNodeIds(nodeIds);

			const query = buildImageExportQuery(
				parsedNodeIds,
				format,
				options.scale as number | undefined,
				options.svgIncludeId as boolean | undefined,
				options.svgSimplifyStroke as boolean | undefined,
				options.useAbsoluteBounds as boolean | undefined,
				options.version as string | undefined,
			);

			response = await figmaApiRequest.call(this, 'GET', `/images/${fileKey}`, undefined, query);
			break;
		}

		case 'getImageFills': {
			const options = this.getNodeParameter('options', i);
			const query: IDataObject = {};

			if (options.version) {
				query.version = options.version;
			}

			response = await figmaApiRequest.call(this, 'GET', `/files/${fileKey}/images`, undefined, query);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return response;
}

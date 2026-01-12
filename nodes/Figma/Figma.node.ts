/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { fileOperations, fileFields, executeFileOperation } from './actions/file';
import { commentOperations, commentFields, executeCommentOperation } from './actions/comment';
import { userOperations, userFields, executeUserOperation } from './actions/user';
import { versionOperations, versionFields, executeVersionOperation } from './actions/version';
import { projectOperations, projectFields, executeProjectOperation } from './actions/project';
import { componentOperations, componentFields, executeComponentOperation } from './actions/component';
import { styleOperations, styleFields, executeStyleOperation } from './actions/style';
import { variableOperations, variableFields, executeVariableOperation } from './actions/variable';
import { devResourceOperations, devResourceFields, executeDevResourceOperation } from './actions/devResource';
import { webhookOperations, webhookFields, executeWebhookOperation } from './actions/webhook';

// Log licensing notice once on load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licenseNoticeLogged = false;

export class Figma implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Figma',
		name: 'figma',
		icon: 'file:figma.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the Figma API to manage design files, comments, components, variables, and more',
		defaults: {
			name: 'Figma',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'figmaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Comment',
						value: 'comment',
					},
					{
						name: 'Component',
						value: 'component',
					},
					{
						name: 'Dev Resource',
						value: 'devResource',
					},
					{
						name: 'File',
						value: 'file',
					},
					{
						name: 'Project',
						value: 'project',
					},
					{
						name: 'Style',
						value: 'style',
					},
					{
						name: 'User',
						value: 'user',
					},
					{
						name: 'Variable',
						value: 'variable',
					},
					{
						name: 'Version',
						value: 'version',
					},
					{
						name: 'Webhook',
						value: 'webhook',
					},
				],
				default: 'file',
			},
			// File operations and fields
			...fileOperations,
			...fileFields,
			// Comment operations and fields
			...commentOperations,
			...commentFields,
			// User operations and fields
			...userOperations,
			...userFields,
			// Version operations and fields
			...versionOperations,
			...versionFields,
			// Project operations and fields
			...projectOperations,
			...projectFields,
			// Component operations and fields
			...componentOperations,
			...componentFields,
			// Style operations and fields
			...styleOperations,
			...styleFields,
			// Variable operations and fields
			...variableOperations,
			...variableFields,
			// Dev Resource operations and fields
			...devResourceOperations,
			...devResourceFields,
			// Webhook operations and fields
			...webhookOperations,
			...webhookFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Log licensing notice once per node load
		if (!licenseNoticeLogged) {
			console.warn(LICENSING_NOTICE);
			licenseNoticeLogged = true;
		}

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				switch (resource) {
					case 'file':
						responseData = await executeFileOperation.call(this, operation, i);
						break;
					case 'comment':
						responseData = await executeCommentOperation.call(this, operation, i);
						break;
					case 'user':
						responseData = await executeUserOperation.call(this, operation, i);
						break;
					case 'version':
						responseData = await executeVersionOperation.call(this, operation, i);
						break;
					case 'project':
						responseData = await executeProjectOperation.call(this, operation, i);
						break;
					case 'component':
						responseData = await executeComponentOperation.call(this, operation, i);
						break;
					case 'style':
						responseData = await executeStyleOperation.call(this, operation, i);
						break;
					case 'variable':
						responseData = await executeVariableOperation.call(this, operation, i);
						break;
					case 'devResource':
						responseData = await executeDevResourceOperation.call(this, operation, i);
						break;
					case 'webhook':
						responseData = await executeWebhookOperation.call(this, operation, i);
						break;
					default:
						throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`);
				}

				// Handle array or single object response
				if (Array.isArray(responseData)) {
					returnData.push(
						...responseData.map((item) => ({
							json: item,
							pairedItem: { item: i },
						})),
					);
				} else {
					returnData.push({
						json: responseData,
						pairedItem: { item: i },
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FigmaApi implements ICredentialType {
	name = 'figmaApi';
	displayName = 'Figma API';
	// eslint-disable-next-line n8n-nodes-base/cred-class-field-documentation-url-miscased
	documentationUrl = 'https://www.figma.com/developers/api';
	properties: INodeProperties[] = [
		{
			displayName: 'Authentication Type',
			name: 'authenticationType',
			type: 'options',
			options: [
				{
					name: 'Personal Access Token',
					value: 'personalAccessToken',
				},
				{
					name: 'OAuth2',
					value: 'oAuth2',
				},
			],
			default: 'personalAccessToken',
		},
		{
			displayName: 'Personal Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			displayOptions: {
				show: {
					authenticationType: ['personalAccessToken'],
				},
			},
			description: 'Personal Access Token from Figma account settings. Format: figd_xxxxx',
		},
		{
			displayName: 'OAuth Access Token',
			name: 'oAuthAccessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			displayOptions: {
				show: {
					authenticationType: ['oAuth2'],
				},
			},
			description: 'OAuth 2.0 access token obtained from Figma OAuth flow',
		},
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authenticationType: ['oAuth2'],
				},
			},
			description: 'OAuth application client ID from figma.com/developers/apps',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			displayOptions: {
				show: {
					authenticationType: ['oAuth2'],
				},
			},
			description: 'OAuth application client secret',
		},
		{
			displayName: 'Refresh Token',
			name: 'refreshToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			displayOptions: {
				show: {
					authenticationType: ['oAuth2'],
				},
			},
			description: 'OAuth refresh token for automatic token renewal',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.authenticationType === "oAuth2" ? $credentials.oAuthAccessToken : $credentials.accessToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.figma.com',
			url: '/v1/me',
		},
	};
}

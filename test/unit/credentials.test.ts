/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { FigmaApi } from '../../credentials/FigmaApi.credentials';

describe('FigmaApi Credentials', () => {
	let credentials: FigmaApi;

	beforeEach(() => {
		credentials = new FigmaApi();
	});

	describe('Credential Definition', () => {
		it('should have the correct name', () => {
			expect(credentials.name).toBe('figmaApi');
		});

		it('should have the correct display name', () => {
			expect(credentials.displayName).toBe('Figma API');
		});

		it('should have documentation URL', () => {
			expect(credentials.documentationUrl).toBe('https://www.figma.com/developers/api');
		});
	});

	describe('Properties', () => {
		it('should have authentication type property', () => {
			const authTypeProp = credentials.properties.find(
				(p) => p.name === 'authenticationType'
			);
			expect(authTypeProp).toBeDefined();
			expect(authTypeProp?.type).toBe('options');
			expect(authTypeProp?.default).toBe('personalAccessToken');
		});

		it('should have access token property for PAT', () => {
			const accessTokenProp = credentials.properties.find(
				(p) => p.name === 'accessToken'
			);
			expect(accessTokenProp).toBeDefined();
			expect(accessTokenProp?.type).toBe('string');
			expect(accessTokenProp?.typeOptions?.password).toBe(true);
		});

		it('should have OAuth properties', () => {
			const oAuthAccessToken = credentials.properties.find(
				(p) => p.name === 'oAuthAccessToken'
			);
			const clientId = credentials.properties.find(
				(p) => p.name === 'clientId'
			);
			const clientSecret = credentials.properties.find(
				(p) => p.name === 'clientSecret'
			);

			expect(oAuthAccessToken).toBeDefined();
			expect(clientId).toBeDefined();
			expect(clientSecret).toBeDefined();
		});
	});

	describe('Authentication', () => {
		it('should have Bearer token authentication', () => {
			expect(credentials.authenticate.type).toBe('generic');
			expect(credentials.authenticate.properties.headers?.Authorization).toContain('Bearer');
		});
	});

	describe('Test Request', () => {
		it('should test against the /me endpoint', () => {
			expect(credentials.test.request.baseURL).toBe('https://api.figma.com');
			expect(credentials.test.request.url).toBe('/v1/me');
		});
	});
});

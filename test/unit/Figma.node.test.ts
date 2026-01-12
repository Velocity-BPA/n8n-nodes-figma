/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { Figma } from '../../nodes/Figma/Figma.node';

describe('Figma Node', () => {
	let node: Figma;

	beforeEach(() => {
		node = new Figma();
	});

	describe('Node Description', () => {
		it('should have the correct display name', () => {
			expect(node.description.displayName).toBe('Figma');
		});

		it('should have the correct name', () => {
			expect(node.description.name).toBe('figma');
		});

		it('should have version 1', () => {
			expect(node.description.version).toBe(1);
		});

		it('should require figmaApi credentials', () => {
			expect(node.description.credentials).toContainEqual({
				name: 'figmaApi',
				required: true,
			});
		});

		it('should have all 10 resources defined', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource'
			);
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.type).toBe('options');
			
			const options = resourceProperty?.options as Array<{ value: string }>;
			expect(options).toBeDefined();
			
			const resourceValues = options?.map((o) => o.value) || [];
			expect(resourceValues).toContain('file');
			expect(resourceValues).toContain('comment');
			expect(resourceValues).toContain('user');
			expect(resourceValues).toContain('version');
			expect(resourceValues).toContain('project');
			expect(resourceValues).toContain('component');
			expect(resourceValues).toContain('style');
			expect(resourceValues).toContain('variable');
			expect(resourceValues).toContain('devResource');
			expect(resourceValues).toContain('webhook');
		});
	});

	describe('File Resource Operations', () => {
		it('should have file operations defined', () => {
			const operations = node.description.properties.filter(
				(p) => p.name === 'operation' && 
				p.displayOptions?.show?.resource?.includes('file')
			);
			expect(operations.length).toBeGreaterThan(0);
		});
	});

	describe('Comment Resource Operations', () => {
		it('should have comment operations defined', () => {
			const operations = node.description.properties.filter(
				(p) => p.name === 'operation' && 
				p.displayOptions?.show?.resource?.includes('comment')
			);
			expect(operations.length).toBeGreaterThan(0);
		});
	});

	describe('Webhook Resource Operations', () => {
		it('should have webhook operations defined', () => {
			const operations = node.description.properties.filter(
				(p) => p.name === 'operation' && 
				p.displayOptions?.show?.resource?.includes('webhook')
			);
			expect(operations.length).toBeGreaterThan(0);
		});
	});
});

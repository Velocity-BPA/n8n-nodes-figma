/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	validateFileKey,
	extractFileKeyFromUrl,
	parseNodeIds,
	formatNodeIdsForApi,
	validateExportScale,
	buildImageExportQuery,
	buildClientMeta,
} from '../../nodes/Figma/transport';

describe('Transport Layer', () => {
	describe('validateFileKey', () => {
		it('should accept valid file keys', () => {
			expect(() => validateFileKey('ABC123xyz')).not.toThrow();
			expect(() => validateFileKey('my-file-key')).not.toThrow();
			expect(() => validateFileKey('file_key_123')).not.toThrow();
		});

		it('should reject empty file keys', () => {
			expect(() => validateFileKey('')).toThrow();
		});

		it('should reject file keys with invalid characters', () => {
			expect(() => validateFileKey('file key')).toThrow(); // spaces
			expect(() => validateFileKey('file/key')).toThrow(); // slashes
			expect(() => validateFileKey('file@key')).toThrow(); // special chars
		});
	});

	describe('extractFileKeyFromUrl', () => {
		it('should extract file key from figma.com/file URL', () => {
			const url = 'https://www.figma.com/file/ABC123xyz/My-Design';
			expect(extractFileKeyFromUrl(url)).toBe('ABC123xyz');
		});

		it('should extract file key from figma.com/design URL', () => {
			const url = 'https://www.figma.com/design/XYZ789def/Another-Design';
			expect(extractFileKeyFromUrl(url)).toBe('XYZ789def');
		});

		it('should throw for invalid URLs', () => {
			expect(() => extractFileKeyFromUrl('https://example.com')).toThrow();
			expect(() => extractFileKeyFromUrl('not-a-url')).toThrow();
		});
	});

	describe('parseNodeIds', () => {
		it('should parse comma-separated node IDs', () => {
			expect(parseNodeIds('1:2, 3:4, 5:6')).toEqual(['1:2', '3:4', '5:6']);
		});

		it('should handle single node ID', () => {
			expect(parseNodeIds('1:2')).toEqual(['1:2']);
		});

		it('should trim whitespace', () => {
			expect(parseNodeIds('  1:2 ,  3:4  ')).toEqual(['1:2', '3:4']);
		});

		it('should filter empty values', () => {
			expect(parseNodeIds('1:2,,3:4')).toEqual(['1:2', '3:4']);
		});
	});

	describe('formatNodeIdsForApi', () => {
		it('should join node IDs with commas', () => {
			expect(formatNodeIdsForApi(['1:2', '3:4', '5:6'])).toBe('1:2,3:4,5:6');
		});

		it('should handle single node ID', () => {
			expect(formatNodeIdsForApi(['1:2'])).toBe('1:2');
		});

		it('should handle empty array', () => {
			expect(formatNodeIdsForApi([])).toBe('');
		});
	});

	describe('validateExportScale', () => {
		it('should accept valid scale values', () => {
			expect(() => validateExportScale(0.01)).not.toThrow();
			expect(() => validateExportScale(1)).not.toThrow();
			expect(() => validateExportScale(2.5)).not.toThrow();
			expect(() => validateExportScale(4)).not.toThrow();
		});

		it('should reject scale values below 0.01', () => {
			expect(() => validateExportScale(0)).toThrow();
			expect(() => validateExportScale(0.001)).toThrow();
		});

		it('should reject scale values above 4', () => {
			expect(() => validateExportScale(4.1)).toThrow();
			expect(() => validateExportScale(10)).toThrow();
		});
	});

	describe('buildImageExportQuery', () => {
		it('should build basic query with required fields', () => {
			const query = buildImageExportQuery(['1:2', '3:4'], 'png');
			expect(query).toEqual({
				ids: '1:2,3:4',
				format: 'png',
			});
		});

		it('should include scale when provided', () => {
			const query = buildImageExportQuery(['1:2'], 'png', 2);
			expect(query.scale).toBe(2);
		});

		it('should include SVG options for SVG format', () => {
			const query = buildImageExportQuery(['1:2'], 'svg', undefined, true, false);
			expect(query.svg_include_id).toBe(true);
			expect(query.svg_simplify_stroke).toBe(false);
		});

		it('should include version when provided', () => {
			const query = buildImageExportQuery(['1:2'], 'png', undefined, undefined, undefined, undefined, 'v123');
			expect(query.version).toBe('v123');
		});
	});

	describe('buildClientMeta', () => {
		it('should return undefined when no parameters provided', () => {
			expect(buildClientMeta()).toBeUndefined();
		});

		it('should build position-based meta', () => {
			const meta = buildClientMeta(100, 200);
			expect(meta).toEqual({ x: 100, y: 200 });
		});

		it('should build node-based meta', () => {
			const meta = buildClientMeta(undefined, undefined, '1:2');
			expect(meta).toEqual({ node_id: '1:2' });
		});

		it('should include node offset when provided with node ID', () => {
			const meta = buildClientMeta(undefined, undefined, '1:2', 10, 20);
			expect(meta).toEqual({
				node_id: '1:2',
				node_offset: { x: 10, y: 20 },
			});
		});

		it('should prefer node-based meta over position-based', () => {
			const meta = buildClientMeta(100, 200, '1:2');
			expect(meta).toEqual({ node_id: '1:2' });
		});
	});
});

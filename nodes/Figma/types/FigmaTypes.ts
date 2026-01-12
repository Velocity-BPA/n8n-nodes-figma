/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface IFigmaUser {
	id: string;
	handle: string;
	img_url: string;
	email?: string;
}

export interface IFigmaFile {
	name: string;
	role: string;
	lastModified: string;
	editorType: string;
	thumbnailUrl: string;
	version: string;
	document?: IFigmaDocument;
	components?: Record<string, IFigmaComponent>;
	componentSets?: Record<string, IFigmaComponentSet>;
	schemaVersion?: number;
	styles?: Record<string, IFigmaStyle>;
	mainFileKey?: string;
	branches?: IFigmaBranch[];
}

export interface IFigmaDocument {
	id: string;
	name: string;
	type: string;
	children?: IFigmaNode[];
}

export interface IFigmaNode {
	id: string;
	name: string;
	type: string;
	children?: IFigmaNode[];
	backgroundColor?: IFigmaColor;
	fills?: IFigmaPaint[];
	strokes?: IFigmaPaint[];
	strokeWeight?: number;
	strokeAlign?: string;
	cornerRadius?: number;
	constraints?: IFigmaConstraints;
	absoluteBoundingBox?: IFigmaRectangle;
	absoluteRenderBounds?: IFigmaRectangle;
	blendMode?: string;
	clipsContent?: boolean;
	preserveRatio?: boolean;
	layoutAlign?: string;
	layoutGrow?: number;
	layoutMode?: string;
	primaryAxisSizingMode?: string;
	counterAxisSizingMode?: string;
	primaryAxisAlignItems?: string;
	counterAxisAlignItems?: string;
	paddingLeft?: number;
	paddingRight?: number;
	paddingTop?: number;
	paddingBottom?: number;
	itemSpacing?: number;
	characters?: string;
	style?: IFigmaTypeStyle;
	characterStyleOverrides?: number[];
	styleOverrideTable?: Record<number, IFigmaTypeStyle>;
	visible?: boolean;
	opacity?: number;
	effects?: IFigmaEffect[];
	exportSettings?: IFigmaExportSetting[];
}

export interface IFigmaColor {
	r: number;
	g: number;
	b: number;
	a: number;
}

export interface IFigmaPaint {
	type: string;
	visible?: boolean;
	opacity?: number;
	color?: IFigmaColor;
	blendMode?: string;
	gradientHandlePositions?: IFigmaVector[];
	gradientStops?: IFigmaColorStop[];
	scaleMode?: string;
	imageTransform?: number[][];
	scalingFactor?: number;
	rotation?: number;
	imageRef?: string;
	gifRef?: string;
	filters?: IFigmaImageFilters;
}

export interface IFigmaVector {
	x: number;
	y: number;
}

export interface IFigmaColorStop {
	position: number;
	color: IFigmaColor;
}

export interface IFigmaImageFilters {
	exposure?: number;
	contrast?: number;
	saturation?: number;
	temperature?: number;
	tint?: number;
	highlights?: number;
	shadows?: number;
}

export interface IFigmaConstraints {
	vertical: string;
	horizontal: string;
}

export interface IFigmaRectangle {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface IFigmaTypeStyle {
	fontFamily?: string;
	fontPostScriptName?: string;
	paragraphSpacing?: number;
	paragraphIndent?: number;
	listSpacing?: number;
	italic?: boolean;
	fontWeight?: number;
	fontSize?: number;
	textCase?: string;
	textDecoration?: string;
	textAutoResize?: string;
	textAlignHorizontal?: string;
	textAlignVertical?: string;
	letterSpacing?: number;
	fills?: IFigmaPaint[];
	hyperlink?: IFigmaHyperlink;
	opentypeFlags?: Record<string, number>;
	lineHeightPx?: number;
	lineHeightPercent?: number;
	lineHeightPercentFontSize?: number;
	lineHeightUnit?: string;
}

export interface IFigmaHyperlink {
	type: string;
	url?: string;
	nodeID?: string;
}

export interface IFigmaEffect {
	type: string;
	visible?: boolean;
	radius?: number;
	color?: IFigmaColor;
	blendMode?: string;
	offset?: IFigmaVector;
	spread?: number;
	showShadowBehindNode?: boolean;
}

export interface IFigmaExportSetting {
	suffix: string;
	format: string;
	constraint: IFigmaExportConstraint;
}

export interface IFigmaExportConstraint {
	type: string;
	value: number;
}

export interface IFigmaComment {
	id: string;
	uuid?: string;
	file_key: string;
	parent_id?: string;
	user: IFigmaUser;
	created_at: string;
	resolved_at?: string;
	message: string;
	client_meta?: IFigmaClientMeta | IFigmaFrameOffset;
	order_id?: number;
	reactions?: IFigmaReaction[];
}

export interface IFigmaClientMeta {
	x?: number;
	y?: number;
	node_id?: string;
	node_offset?: IFigmaVector;
}

export interface IFigmaFrameOffset {
	node_id: string;
	node_offset: IFigmaVector;
}

export interface IFigmaReaction {
	user: IFigmaUser;
	emoji: string;
	created_at: string;
}

export interface IFigmaVersion {
	id: string;
	created_at: string;
	label?: string;
	description?: string;
	user: IFigmaUser;
	thumbnail_url?: string;
}

export interface IFigmaProject {
	id: number;
	name: string;
}

export interface IFigmaProjectFile {
	key: string;
	name: string;
	thumbnail_url: string;
	last_modified: string;
}

export interface IFigmaComponent {
	key: string;
	file_key?: string;
	node_id?: string;
	thumbnail_url?: string;
	name: string;
	description?: string;
	created_at?: string;
	updated_at?: string;
	user?: IFigmaUser;
	containing_frame?: IFigmaFrameInfo;
	containing_page?: IFigmaPageInfo;
}

export interface IFigmaComponentSet {
	key: string;
	file_key?: string;
	node_id?: string;
	thumbnail_url?: string;
	name: string;
	description?: string;
	created_at?: string;
	updated_at?: string;
	user?: IFigmaUser;
	containing_frame?: IFigmaFrameInfo;
	containing_page?: IFigmaPageInfo;
}

export interface IFigmaFrameInfo {
	name?: string;
	nodeId: string;
	pageId: string;
	pageName: string;
	backgroundColor?: string;
	containingStateGroup?: IFigmaContainingStateGroup;
}

export interface IFigmaContainingStateGroup {
	name: string;
	nodeId: string;
}

export interface IFigmaPageInfo {
	name: string;
	id: string;
}

export interface IFigmaStyle {
	key: string;
	file_key?: string;
	node_id?: string;
	style_type: string;
	thumbnail_url?: string;
	name: string;
	description?: string;
	created_at?: string;
	updated_at?: string;
	user?: IFigmaUser;
	sort_position?: string;
}

export interface IFigmaVariable {
	id: string;
	name: string;
	key: string;
	variableCollectionId: string;
	resolvedType: string;
	valuesByMode: Record<string, IFigmaVariableValue>;
	remote?: boolean;
	description?: string;
	hiddenFromPublishing?: boolean;
	scopes?: string[];
	codeSyntax?: Record<string, string>;
}

export interface IFigmaVariableValue {
	type?: string;
	value?: unknown;
}

export interface IFigmaVariableCollection {
	id: string;
	name: string;
	key: string;
	modes: IFigmaVariableMode[];
	defaultModeId: string;
	remote?: boolean;
	hiddenFromPublishing?: boolean;
	variableIds?: string[];
}

export interface IFigmaVariableMode {
	modeId: string;
	name: string;
}

export interface IFigmaDevResource {
	id: string;
	name: string;
	url: string;
	file_key: string;
	node_id: string;
}

export interface IFigmaWebhook {
	id: string;
	team_id: string;
	event_type: string;
	client_id?: string;
	endpoint: string;
	passcode: string;
	status: string;
	description?: string;
	protocol_version?: string;
}

export interface IFigmaBranch {
	key: string;
	name: string;
	thumbnail_url: string;
	last_modified: string;
	link_access: string;
}

export interface IFigmaImageResponse {
	err: string | null;
	images: Record<string, string | null>;
}

export interface IFigmaImageFillsResponse {
	err: string | null;
	meta: {
		images: Record<string, string>;
	};
}

export interface IFigmaPaginationMeta {
	cursor?: string;
}

export interface IFigmaApiResponse<T> {
	err?: string;
	status?: number;
	meta?: IFigmaPaginationMeta;
	[key: string]: T | string | number | IFigmaPaginationMeta | undefined;
}

export type FigmaResourceType = 
	| 'file'
	| 'comment'
	| 'user'
	| 'version'
	| 'project'
	| 'component'
	| 'style'
	| 'variable'
	| 'devResource'
	| 'webhook';

export type FigmaFileOperation = 
	| 'get'
	| 'getNodes'
	| 'getImages'
	| 'getImageFills';

export type FigmaCommentOperation = 
	| 'getAll'
	| 'create'
	| 'delete'
	| 'getReactions'
	| 'addReaction'
	| 'deleteReaction';

export type FigmaUserOperation = 'getMe';

export type FigmaVersionOperation = 
	| 'getVersions'
	| 'getNamedVersions';

export type FigmaProjectOperation = 
	| 'getFiles'
	| 'getProjects';

export type FigmaComponentOperation = 
	| 'getTeamComponents'
	| 'getFileComponents'
	| 'getComponent'
	| 'getTeamComponentSets'
	| 'getFileComponentSets'
	| 'getComponentSet';

export type FigmaStyleOperation = 
	| 'getTeamStyles'
	| 'getFileStyles'
	| 'getStyle';

export type FigmaVariableOperation = 
	| 'getLocalVariables'
	| 'getPublishedVariables'
	| 'createVariables'
	| 'updateVariables'
	| 'deleteVariables';

export type FigmaDevResourceOperation = 
	| 'getDevResources'
	| 'createDevResource'
	| 'updateDevResource'
	| 'deleteDevResource';

export type FigmaWebhookOperation = 
	| 'getTeamWebhooks'
	| 'createWebhook'
	| 'getWebhook'
	| 'updateWebhook'
	| 'deleteWebhook';

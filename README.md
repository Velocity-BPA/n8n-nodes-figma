# n8n-nodes-figma

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Figma providing 10 resources and 40+ operations for design file management, collaboration, exports, version history, components, styles, variables, dev resources, and webhooks.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **File Operations**: Get files, nodes, export images in PNG/JPG/SVG/PDF formats
- **Comments**: Create, read, delete comments with position support and emoji reactions
- **Version History**: Track file versions and named versions
- **Projects**: Manage team projects and file listings
- **Components**: Access published components and component sets
- **Styles**: Retrieve design system styles
- **Variables**: Full CRUD operations for design tokens (colors, numbers, booleans, strings)
- **Dev Resources**: Link external resources to design nodes
- **Webhooks**: Manage webhook subscriptions for real-time events
- **Rate Limiting**: Built-in exponential backoff retry logic
- **Pagination**: Automatic handling for large result sets

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Click **Install a community node**
4. Enter `n8n-nodes-figma`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Clone or copy the package
npm install n8n-nodes-figma
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-figma.git
cd n8n-nodes-figma

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-figma

# Restart n8n
n8n start
```

## Credentials Setup

### Personal Access Token (Recommended)

| Field | Description |
|-------|-------------|
| Authentication Type | Select "Personal Access Token" |
| Access Token | Your Figma Personal Access Token |

**To generate a Personal Access Token:**
1. Go to your Figma account settings
2. Navigate to the **Personal Access Tokens** section
3. Click **Generate new token**
4. Copy the token (format: `figd_xxxxxxxxxxxxx`)

### OAuth 2.0

| Field | Description |
|-------|-------------|
| Authentication Type | Select "OAuth 2.0" |
| Access Token | OAuth access token from your app |
| Client ID | Your Figma app's client ID |
| Client Secret | Your Figma app's client secret |

## Resources & Operations

### File

| Operation | Description |
|-----------|-------------|
| Get | Get a file by key |
| Get Nodes | Get specific nodes from a file |
| Get Images | Export images from a file |
| Get Image Fills | Get URLs for embedded images |

**Parameters:**
- `fileKey`: The file's unique identifier (from URL)
- `nodeIds`: Comma-separated list of node IDs
- `format`: Export format (PNG, JPG, SVG, PDF)
- `scale`: Export scale (0.01-4)
- `depth`: Node tree traversal depth
- `version`: Specific file version ID

### Comment

| Operation | Description |
|-----------|-------------|
| Get All | Get all comments on a file |
| Create | Post a new comment |
| Delete | Delete a comment |
| Get Reactions | Get reactions on a comment |
| Add Reaction | Add emoji reaction |
| Delete Reaction | Remove a reaction |

### User

| Operation | Description |
|-----------|-------------|
| Get Me | Get authenticated user info |

### Version

| Operation | Description |
|-----------|-------------|
| Get Versions | Get file version history |
| Get Named Versions | Get only named versions |

### Project

| Operation | Description |
|-----------|-------------|
| Get Projects | Get all projects for a team |
| Get Files | Get files in a project |

### Component

| Operation | Description |
|-----------|-------------|
| Get Team Components | Get published components for team |
| Get File Components | Get published components in file |
| Get Component | Get component by key |
| Get Team Component Sets | Get component sets for team |
| Get File Component Sets | Get component sets in file |
| Get Component Set | Get component set by key |

### Style

| Operation | Description |
|-----------|-------------|
| Get Team Styles | Get published styles for team |
| Get File Styles | Get published styles in file |
| Get Style | Get style by key |

### Variable

| Operation | Description |
|-----------|-------------|
| Get Local Variables | Get local variables in file |
| Get Published Variables | Get published variables |
| Create Variables | Create new variables |
| Update Variables | Update existing variables |
| Delete Variables | Delete variables |

**Variable Types:** BOOLEAN, COLOR, FLOAT, STRING

### Dev Resource

| Operation | Description |
|-----------|-------------|
| Get Dev Resources | Get dev resources in file |
| Create Dev Resource | Create dev resource link |
| Update Dev Resource | Update dev resource |
| Delete Dev Resource | Delete dev resource |

### Webhook

| Operation | Description |
|-----------|-------------|
| Get Team Webhooks | List webhooks for team |
| Create Webhook | Create new webhook |
| Get Webhook | Get webhook by ID |
| Update Webhook | Update webhook |
| Delete Webhook | Delete webhook |

**Event Types:**
- `FILE_UPDATE` - File was modified
- `FILE_DELETE` - File was deleted
- `FILE_VERSION_UPDATE` - New version created
- `FILE_COMMENT` - Comment was added
- `LIBRARY_PUBLISH` - Library was published

## Usage Examples

### Export an Image from a Figma File

```
1. Add a Figma node to your workflow
2. Select "File" resource and "Get Images" operation
3. Enter the File Key (from your Figma URL)
4. Enter Node IDs of the elements to export
5. Choose format (PNG/JPG/SVG/PDF) and scale
6. Execute to get download URLs
```

### Post a Comment on a Design

```
1. Add a Figma node
2. Select "Comment" resource and "Create" operation
3. Enter the File Key
4. Enter your comment message
5. Optionally set position (x, y coordinates)
6. Execute to post the comment
```

### Get Design Tokens (Variables)

```
1. Add a Figma node
2. Select "Variable" resource and "Get Local Variables" operation
3. Enter the File Key
4. Execute to retrieve all design tokens
```

## Figma Concepts

### File Key

The file key is the unique identifier for a Figma file. You can find it in the URL:
```
https://www.figma.com/file/{FILE_KEY}/File-Name
```

### Node IDs

Node IDs identify specific elements in a Figma file. You can find them by:
1. Right-clicking an element in Figma
2. Selecting "Copy link"
3. The node ID is in the URL after `node-id=`

### Team ID

Team IDs are used for team-level operations. Find yours at:
```
https://www.figma.com/files/team/{TEAM_ID}/team-name
```

## Error Handling

The node includes built-in error handling for common Figma API errors:

| Error Code | Description | Action |
|------------|-------------|--------|
| 400 | Bad Request | Check parameter values |
| 403 | Forbidden | Verify API permissions |
| 404 | Not Found | Check file/resource exists |
| 429 | Rate Limited | Automatic retry with backoff |

Rate limiting uses exponential backoff with up to 5 retry attempts.

## Security Best Practices

1. **Use Personal Access Tokens** for individual use, OAuth for apps
2. **Limit token scope** to only required permissions
3. **Store credentials securely** in n8n's credential system
4. **Rotate tokens regularly** for production use
5. **Never expose tokens** in logs or error messages

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in watch mode
npm run dev

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-figma/issues)
- **Documentation**: [Figma API Docs](https://www.figma.com/developers/api)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [Figma](https://www.figma.com) for their comprehensive API
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for inspiration and support

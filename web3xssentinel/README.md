# Web3XSSentinel

Web3XSSentinel is a CLI tool designed to detect and simulate Cross-Site Scripting (XSS) vulnerabilities in Web3 decentralized applications (dApps), with a focus on vulnerabilities that could lead to wallet exploitation.

## Features

- Crawls Web3 dApps using Playwright headless browser
- Injects a comprehensive set of XSS payloads, including advanced and WAF bypass payloads
- Simulates wallet APIs (e.g., MetaMask) to detect malicious wallet interactions
- Generates detailed reports in JSON or Markdown format
- CLI interface with options for verbosity and output format

## Installation

1. Clone the repository or download the source code.

2. Navigate to the project directory:

```bash
cd web3xssentinel
```

3. Install dependencies:

```bash
npm install
```

4. Install Playwright browsers:

```bash
npx playwright install
```

## Usage

Run the tool using the CLI:

```bash
node index.js scan <target-url> [options]
```

### Options

- `-o, --output <format>`: Output format for the report (`json` or `markdown`). Default is `json`.
- `-v, --verbose`: Enable verbose logging.

### Example

```bash
node index.js scan https://example-dapp.com -o markdown -v
```

This command scans the specified dApp URL, outputs the report in Markdown format, and enables verbose logging.

## Testing

Run unit tests with:

```bash
npm test
```

## License

MIT License

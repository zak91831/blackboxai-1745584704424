const fs = require('fs');
const path = require('path');

class Reporter {
  constructor(results) {
    this.results = results;
  }

  generateReport() {
    if (!this.results || this.results.length === 0) {
      console.log('No vulnerabilities detected.');
      return;
    }

    const report = {
      timestamp: new Date().toISOString(),
      findings: this.results
    };

    const reportJson = JSON.stringify(report, null, 2);
    const reportPath = path.join(process.cwd(), 'web3xssentinel-report.json');

    fs.writeFileSync(reportPath, reportJson);
    console.log('Report generated at:', reportPath);
  }
}

module.exports = Reporter;

const { expect } = require('chai');
const Crawler = require('../src/crawler');

describe('Crawler Module', function() {
  this.timeout(30000); // Increase timeout for Playwright operations

  it('should return results array', async () => {
    const crawler = new Crawler('https://example.com');
    const results = await crawler.run();
    expect(results).to.be.an('array');
  });
});

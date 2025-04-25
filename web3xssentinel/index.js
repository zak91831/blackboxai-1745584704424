#!/usr/bin/env node

const { program } = require('commander');
const Crawler = require('./src/crawler');
const Reporter = require('./src/reporter');

program
  .name('web3xssentinel')
  .description('Detect and simulate XSS vulnerabilities in Web3 dApps')
  .version('1.0.0');

program
  .command('scan <url>')
  .description('Scan a Web3 dApp URL for XSS vulnerabilities')
  .action(async (url) => {
    console.log("Starting scan for: " + url);
    const crawler = new Crawler(url);
    const results = await crawler.run();
    const reporter = new Reporter(results);
    reporter.generateReport();
  });

program.parse(process.argv);

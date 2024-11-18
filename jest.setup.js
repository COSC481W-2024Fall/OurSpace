const { TextEncoder, TextDecoder } = require('util');
global.fetch = require('node-fetch');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;


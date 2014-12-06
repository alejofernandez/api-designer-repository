#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var util = require('util');
var open = require('opener');
var whichSync = require('which').sync;
var server = require('..');

module.exports = main;

if (require.main == module)
  main();

//-- Implementation --

function main() {  
  openBrowserAndPrintInfo();
}

function openBrowserAndPrintInfo() {

  var url = 'http://localhost:8090/designer/';

  open(url);

  console.log('Node Api-Designer is now available from %s', url);
  
}

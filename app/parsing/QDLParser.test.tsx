/// <reference path="../../typings/expect/expect.d.ts" />
/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/custom/require.d.ts" />

import {QDLParser} from './QDLParser'
import {prettifyMsgs} from './Logger'
import {XMLRenderer} from './render/XMLRenderer'
import {Block, BlockList} from './block/BlockList'
import TestData from './TestData'

var expect: any = require('expect');

var prettifyHTML = (require("html") as any).prettyPrint;

describe('QDLParser', () => {
  it('parses basic QDL to XML', () => {
    var qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.basicMD));
    var msgs = qdl.getFinalizedLogs()

    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.basicXML);
    expect(msgs['error']).toEqual([]);
    expect(msgs['warning']).toEqual([]);
  });

  it('errors if path not ending in "end"');

  it('errors on no input', () => {
    var qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(''));

    expect(prettifyHTML(qdl.getResult().toString())).toEqual(TestData.emptyXML);
    expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.emptyError);
  });

  it('errors if only quest block');

  it('errors if no quest header at start', () => {
    var qdl = new QDLParser(XMLRenderer);

    qdl.render(new BlockList(TestData.noHeaderMD));

    expect(prettifyMsgs(qdl.getFinalizedLogs()['error'])).toEqual(TestData.noHeaderError);
  });


});
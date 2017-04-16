const acequire: any = (require('brace') as any).acequire;
const oop = acequire('ace/lib/oop') as any;
const { Range } = acequire('ace/range');
const TextMode = (acequire('ace/mode/text') as any).Mode;
const MatchingBraceOutdent = (acequire('ace/mode/matching_brace_outdent') as any).MatchingBraceOutdent;
const MarkdownHighlightRules = (acequire('ace/mode/markdown_highlight_rules') as any).MarkdownHighlightRules;


// designed with https://ace.c9.io/tool/mode_creator.html
var QDLHighlightRules: any = function() {
  this.$rules = new MarkdownHighlightRules().getRules();

  let listblock = this.$rules['listblock'];
  for (let r in listblock) {
    if (listblock[r].token === 'empty_line') {
      listblock[r].regex = /^\s*$/; // Match empty lines and whitespace too
      break;
    }
  }

  let start = this.$rules['start'];
  for (let s in start) {
    if (start[s].token === 'markup.list') {
      start[s].regex = '^\\s*(?:[*+-]|\\d+\\.)\\s+';
    }
    if (start[s].token === 'markup.heading.1') {
      start[s].regex = '^\s*(> .*)';
    }
  }
};
oop.inherits(QDLHighlightRules, MarkdownHighlightRules);


class QDLFoldMode {

  // least to most important; which is to say that folds end on lines of equal or greater importance
  // will fold all less important lines inside of them (ie titles will fold cards, but choices will stop at cards)
  static foldingStartMarkers = [
    /(^\s*)(\* .*)/, // * choices
    /(^\s*)(_.*_)/, // _cards_
    /(^\s*)(# .*)/ // # titles
  ];
  static foldingStartMarker = new RegExp(QDLFoldMode.foldingStartMarkers.map((x: any) => {return x.source}).join('|'));

  private static getIndent(line: string): number {
    let indent = 0;
    while (line[indent] === ' ') {
      indent++;
    }
    return indent;
  }

  private static getImportance(line: string): number {
    // check against most important marker first (see foldingStartMarkers)
    for (let i = QDLFoldMode.foldingStartMarkers.length - 1; i >= 0; i--) {
      if (line.match(QDLFoldMode.foldingStartMarkers[i])) {
        return i;
      }
    }
    return -1;
  }

  getFoldWidget(session: any, foldStyle: any, row: number) : string {
      var line = session.getLine(row);
      return QDLFoldMode.foldingStartMarker.test(line) ? 'start' : '';
  }

  getFoldWidgetRange(session: any, foldStyle: any, row: number): any {

      let line = session.getLine(row);

      if (!line.match(QDLFoldMode.foldingStartMarker)) {
        return;
      }

      const startRow = row;
      const startColumn = line.length;
      const maxRow = session.getLength();
      const startIndent = QDLFoldMode.getIndent(line);
      const startImportance = QDLFoldMode.getImportance(line);
      let endRow = maxRow;

      for (row += 1; row < maxRow; row++) {
        line = session.getLine(row);
        if (QDLFoldMode.getIndent(line) <= startIndent && QDLFoldMode.getImportance(line) >= startImportance) {
          endRow = row - 1;
          break;
        }
      }

    return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
  }
}

export var QDLMode: any = function() {
  // set everything up
  this.HighlightRules = QDLHighlightRules;
  this.$outdent = new MatchingBraceOutdent();
  this.foldingRules = new QDLFoldMode();
};
oop.inherits(QDLMode, TextMode);

(function() {
  // configure comment start/end characters
  this.lineCommentStart = '//';
  this.blockComment = {start: '/*', end: '*/'};

  this.getNextLineIndent = function(state: any, line: any, tab: any) {
    var indent = this.$getIndent(line);

    // Add some space right after a choice.
    if (line.trim().startsWith('* ')) {
      // TODO: Figure out why whitespace is required before newline to have correct syntax highlighting
      return ' \n' + indent + '  ';
    }
    return indent;
  };

  this.checkOutdent = function(state: any, line: any, input: any) {
    return this.$outdent.checkOutdent(line, input);
  };

  this.autoOutdent = function(state: any, doc: any, row: any) {
    return this.$outdent.autoOutdent(doc, row);
  };

  // TODO: create worker for live syntax checking/validation

}).call(QDLMode.prototype);

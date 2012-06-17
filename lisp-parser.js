
// Parser

lisp.Parser = function(str) {
    // We parse by cutting off chunks of 'input'
    this.str = str;
    this.input = str;
};
lisp.Parser.prototype = {
    // Return a nice error position description
    parseError: function() {
        var pos = this.str.length - this.input.length;
        var start = this.str.substr(0, pos);
        throw 'parse error: ' + start + '<here>' + this.input;
    },

    // Token types, and regexps used to match them.
    // withEnd=true means that we require a space (or non-atom) immediately
    // after the token
    tokenTypes: [
        { type: '(', re: /^\(/ },
        { type: ')', re: /^\)/ },
        { type: '.', re: /^\./, withEnd: true },
        { type: '\'', re: /^\'/ },
        { type: 'number', re: /^-?(\.\d+|\d+\.\d*|\d+)/, withEnd: true },
        { type: 'symbol', re: /^[^\s\(\);]+/, withEnd: true }
    ],

    tokenEnd: /^[\(\)\s;]/,

    consumeSpaces: function() {
        var inComment = false;
        for (var pos = 0; pos < this.input.length; pos++) {
            var c = this.input[pos];
            if (inComment)
            {
                if (c == '\n')
                    inComment = false;
            } else {
                if (c == ';')
                    inComment = true;
                else if (/\S/.test(c)) // not a space
                    break;
            }
        }
        if (pos > 0)
            this.input = this.input.substr(pos);
    },

    // Read a single token. Return null on end of input
    readToken: function() {
        this.consumeSpaces();
        if (this.input.length == 0)
            return null;

        for (var i = 0; i < this.tokenTypes.length; ++i) {
            var t = this.tokenTypes[i];

            var m = t.re.exec(this.input);
            if (m == null)
                continue;

            var n = m[0].length;

            // do we require a non-atom after this token?
            if (t.withEnd)
                if (!(n == this.input.length || this.tokenEnd.test(this.input[n])))
                    continue;

            this.input = this.input.substr(n);
            return { type: t.type, s: m[0] };
        }
        this.parseError();
    },

    // Push a token back to input
    unreadToken: function(token) {
        this.input = token.s + this.input;
    },

    empty: function() {
        return this.input.length == 0;
    },

    // Try to parse one term. Returns a lisp term on success, null on end of input
    // or unexpected input
    readTerm: function() {
        var tok = this.readToken();
        if (tok == null) // end of input
            return null;

        switch (tok.type) {
        case 'number':
            return new lisp.Number(parseFloat(tok.s));

        case 'symbol':
            {
                var s = tok.s.toLowerCase();
                if (s == 'nil')
                    return lisp.nil;
                else
                    return new lisp.Symbol(s);
            }

        case '\'': // quote
            {
                var term = this.readTerm();
                if (term == null)
                    this.parseError();
                return new lisp.Cons(
                    new lisp.Symbol('quote'),
                    new lisp.Cons(
                        term,
                        lisp.nil));
            }

        case '(':
            // cons/list - we respect the dot-notation (1 2 . 3)
            {
                var cdr = lisp.nil;
                var list = [];
                for (;;) {
                    var term = this.readTerm();
                    if (term != null) {
                        list.push(term);
                    } else {
                        // end of list
                        var tok = this.readToken();
                        if (tok == null)
                            this.parseError();

                        // first check for '. term'
                        if (tok.type == '.') {
                            cdr = this.readTerm();
                            if (cdr == null)
                                this.parseError();
                            tok = this.readToken();
                            if (tok == null)
                                this.parseError();
                        }

                        // then check for ')'
                        if (tok.type != ')')
                            this.parseError();
                        return lisp.listToTerm(list, cdr);
                    }
                } // for
            } // case

        default:
            this.unreadToken(tok);
            return null;
        } // switch
    },

    // Check if the rest of the string is empty
    ensureEmpty: function() {
        this.consumeSpaces();
        if (this.input.length > 0)
            this.parseError();
    }
};

// Parse a string. Returns a term, or null if the string is empty
lisp.parse = function(str) {
    var parser = new lisp.Parser(str);
    var term = parser.readTerm();
    parser.ensureEmpty();
    return term;
};

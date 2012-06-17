
// Builtin functions

lisp.checkAllNumbers = function(args) {
    for (var i = 0; i < args.length; i++)
        lisp.checkType(args[i], 'number');
};

lisp.env.vars['+'] = new lisp.Func(
    '+', function(args) {
        lisp.checkAllNumbers(args);
        var n = 0;
        for (var i = 0; i < args.length; i++)
            n += args[i].n;
        return new lisp.Number(n);
    });

lisp.env.vars['*'] = new lisp.Func(
    '*', function(args) {
        lisp.checkAllNumbers(args);
        var n = 1;
        for (var i = 0; i < args.length; i++)
            n *= args[i].n;
        return new lisp.Number(n);
    });

lisp.env.vars['-'] = new lisp.Func(
    '-', function(args) {
        lisp.checkAllNumbers(args);

        if (args.length == 0)
            throw 'too few arguments to '+name;
        else if (args.length == 1)
            return new lisp.Number(-args[0].n);

        var n = args[0].n;
        for (var i = 1; i < args.length; i++)
            n -= args[i].n;
        return new lisp.Number(n);
    });

lisp.env.vars['/'] = new lisp.Func(
    '/', function(args) {
        lisp.checkAllNumbers(args);

        if (args.length == 0)
            throw 'too few arguments to '+name;
        else if (args.length == 1) {
            if (args[0].n == 0)
                throw 'division by zero';
            return new lisp.Number(1/args[0].n);
        }

        var n = args[0].n;
        for (var i = 1; i < args.length; i++) {
            if (args[i].n == 0)
                throw 'division by zero';
            n /= args[i].n;
        }
        return new lisp.Number(n);
    });

lisp.env.vars.t = new lisp.Symbol('t');
lisp.env.vars.t.eval = function() { return this; };

lisp.env.vars.eval = new lisp.Func('eval', function(args) {
                                       lisp.checkNumArgs('eval', 1, args);
                                       return args[0].eval(lisp.env);
                                   });

lisp.tSym = lisp.env.vars.t;

lisp.boolTerm = function(v) { return v ? lisp.tSym : lisp.nil; };

lisp.env.vars.list = new lisp.Func('list', function(args) {
                                       return lisp.listToTerm(args);
                              });
lisp.env.vars.cons = new lisp.Func('cons', function(args) {
                                       lisp.checkNumArgs('cons', 2, args);
                                       return new lisp.Cons(args[0], args[1]);
                                   });
lisp.env.vars.car = new lisp.Func('car', function(args) {
                                      lisp.checkNumArgs('car', 1, args);
                                      lisp.checkType(args[0], 'cons');
                                      return args[0].car;
                                   });
lisp.env.vars.cdr = new lisp.Func('cdr', function(args) {
                                      lisp.checkNumArgs('car', 1, args);
                                      lisp.checkType(args[0], 'cons');
                                      return args[0].cdr;
                                   });
lisp.env.vars['empty?'] = new lisp.Func('empty?', function(args) {
                                            lisp.checkNumArgs('empty?', 1, args);
                                            return lisp.boolTerm(args[0].type == 'nil');
                                        });

lisp.compareFunc = function(name, func) {
    return new lisp.Func(
        name, function(args) {
            lisp.checkNumArgs(name, 2, args);
            lisp.checkType(args[0], 'number');
            lisp.checkType(args[1], 'number');
            return lisp.boolTerm(func(args[0].n, args[1].n));
        });
};



lisp.env.vars['=']  = lisp.compareFunc('=',  function(a,b) { return a == b; });
lisp.env.vars['/='] = lisp.compareFunc('/=', function(a,b) { return a != b; });
lisp.env.vars['>']  = lisp.compareFunc('>',  function(a,b) { return a > b; });
lisp.env.vars['>='] = lisp.compareFunc('>=', function(a,b) { return a >= b; });
lisp.env.vars['<']  = lisp.compareFunc('<',  function(a,b) { return a < b; });
lisp.env.vars['<='] = lisp.compareFunc('<=', function(a,b) { return a <= b; });
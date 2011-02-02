var sys = require('sys');
var stdio = process.binding('stdio');

module.exports = Prompt;
function Prompt(question, cb) {
    if (!(this instanceof Prompt)) return new Prompt(question, cb);
    if ((question && cb) !== undefined) prompt(question, cb);
    var self = this;
    var vars = {};
    var queue = [];


    self.ask = function (question, into) {
        queue.push({ task : 'ask', q: question, into: into });
        return self;
    }

    self.discreet = function (question, into) {
        queue.push({ task : 'discreet', q: question, into: into });
        return self;
    }

    self.tap = function (f) {
        queue.push({ task : 'tap', f : f });
        return self;
    }

    //Getting rid of "end" would mean making processQueue() starting automatically,
    //given a queue length of 1 or something. Totally doable, but this change isn't a priority.
    //One suggestion, by James, is to setTimeout on the first method.
    self.end = function () {
        processQueue();
    }

    function processQueue () { 
        task = queue.shift();
        if (task === undefined) return;
        if (task.task == 'ask' || task.task == 'discreet') {
            prompt(task.q, function (resp) {
                 if (typeof task.into === 'string') {
                     vars[task.into] = resp;
                 }
                 else if (typeof task.into === 'function') {
                     task.into(resp);
                 }
                 processQueue();
            }, task.task == 'ask' ? false : true);
        }
        else if (task.task == 'tap') {
            task.f(vars);
            processQueue();
        }
    }

    function prompt(question, cb, quiet) {
        var p = process.openStdin();
        console.log(question);
        if (quiet) {
            //Basically stolen from isaacs/s npm/utils/prompt.js
            stdio.setRawMode('true');
            var line = "";
            p.on('data', function(ch) {
                ch = "" + ch;
                switch (ch) {
                    case "\n": case "\r": case "\r\n": case "\u0004":
                        stdio.setRawMode('false');
                        p.removeAllListeners('data');
                        cb(line);
                    case "\u0003": case "\0":
                        stdio.setRawMode('false');
                        process.exit();
                        break;
                    default:
                        line += ch;
                        break
                }
            });
        } else {
            p.on('data', function(line) {
                p.removeAllListeners('data');
                cb(line);
                if (p.listeners('data').length === 0) {
                    p.destroy();
                }
            });
        }
    }
}
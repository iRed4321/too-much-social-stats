import {IString, IValue, TimeRange} from './common';

function replaceEmojis(txt:string){
    var from = ['󾌴', '󾦇', '󾮟'];
    var to = ['joy', 'beers', 'ok_hand'];

    // var txtNew = '';
    
    for (let i = 0; i < from.length; i++) {
        txt = txt.replaceAll(from[i], ':'+to[i]+':');
    }
    return txt;
}

class MsgStat {
    readonly charCount: number;
    readonly wordCount: number;
    readonly author: number;

    constructor(msg: string, author: number) {
        this.charCount = msg.length;
        this.wordCount = msg.split(' ').length;
        this.author = author;
    }

    getCharCount() {
        return this.charCount;
    }

    getWordCount() {
        return this.wordCount;
    }

    getAuthor() {
        return this.author;
    }

    getAuthorName(list: string[]) {
        return list[this.author];
    }

    isAuthor(test: number) {
        return test === this.author;
    }

    getStats() {
        return {
            chars: this.charCount,
            words: this.wordCount
        }
    }
}


class Msg {
    sender_name: string;
    timestamp_ms: number;
    content: string;
}

class ConvStats {
    readonly participants: IString;
    readonly title: string;
    msgs: { [index: number]: MsgStat };

    constructor(title: string, participants: IString) {
        this.participants = participants;
        this.title = title;
        this.msgs = {};
    }

    addMsgs(msgs: Msg) {
        Object.values(msgs).forEach((msg) => {
            let author = getKeyByValue(this.participants, msg.sender_name);
            if (msg.content != undefined && author != undefined) {
                this.msgs[msg.timestamp_ms] = new MsgStat(msg.content, author);
            }
        });

    }


    getWordCount(time:TimeRange = null) {
        var count:IValue = {};
        Object.keys(this.getAuthors()).forEach( function (element) {
            count[element] = 0;
        });
        if (time == null) {
            Object.values(this.msgs).forEach(msg => {
                count[msg.getAuthor()] += msg.getWordCount();
            });
        } else {
            for (let timestamp in this.msgs) {
                const tp = timestamp as unknown as number;
                if (tp > time.min && tp < time.max) {
                    count[this.msgs[timestamp].getAuthor()] += this.msgs[timestamp].getWordCount();
                }
            }
        }
        return count;
    }

    getCharCount(time:TimeRange = null) {
        var count:IValue = {};
        Object.keys(this.getAuthors()).forEach(element => {
            count[element] = 0;
        });
        if (time == null) {
            Object.values(this.msgs).forEach(msg => {
                count[msg.getAuthor()] += msg.getCharCount();
            });
        } else {
            for (const timestamp in this.msgs) {
                const tp = timestamp as unknown as number;
                if (tp > time.min && tp < time.max) {
                    count[this.msgs[timestamp].getAuthor()] += this.msgs[timestamp].getCharCount();
                }
            }
        }
        return count;
    }

    getMsgCount(time:TimeRange = null) {
        var count:IValue = {};
        Object.keys(this.getAuthors()).forEach(element => {
            count[element] = 0;
        });
        if (time == null) {
            for (const timestamp in this.msgs) {
                count[this.msgs[timestamp].getAuthor()]++;
            }
        } else {
            for (const timestamp in this.msgs) {
                const tp = timestamp as unknown as number;
                if (tp > time.min && tp < time.max) {
                    count[this.msgs[timestamp].getAuthor()]++;
                }
            }
        }

        return count;
    }

    getCount(what:string, time:TimeRange) {
        switch (what) {
            case 'word':
                return this.getWordCount(time);
            case 'msg':
                return this.getMsgCount(time);
            case 'char':
                return this.getCharCount(time);
        }
    }

    getCountAll(what:string, time:TimeRange = null) {
        var all = this.getCount(what, time);
        var total = 0;

        for (const someone in all) {
            total += all[someone];
        }
        return total;
    }

    getStats(time:TimeRange = null) {
        return {
            msgs: Object.values(this.getMsgCount(time)),
            words: Object.values(this.getWordCount(time)),
            chars: Object.values(this.getCharCount(time))
        }
    }

    getAuthors() {
        return this.participants;
    }

    getAuthorCount() {
        return Object.keys(this.participants).length;
    }

    getTimeFirst():number {
        return Object.keys(this.msgs)[0] as unknown as number;
    }

    getTimeLast():number {
        return Object.keys(this.msgs)[Object.keys(this.msgs).length - 1] as unknown as number;;
    }

    getTitle() {
        return this.title;
    }

    getPeopleProperties() {

        var colSpace = 360 / this.getAuthorCount();
        var people = {};
        var count = 0;

        Object.keys(this.participants).forEach(key => {
            people[key] = {
                name: this.participants[key],
                color: 'hsl(' + colSpace * count + ', 60%, 50%)',
            }
            count++;
        });

        return people;
    }

}

function getKeyByValue(object, value: number):number {
    return Object.keys(object).find(key => object[key] === value) as unknown as number;;
}

class AllConvsStats {
    readonly participants: IString;
    readonly convs: ConvStats[];

    constructor(convs) {
        convs = convs.filter(function (conv) {
            return conv.hasOwnProperty('thread_type') && conv.thread_type.startsWith("Regular");
        });

        var joined:{[index: string]: ConvStats} = {};

        var tempparticipants:IString = {};

        convs.forEach(function (conv) {
            var id = conv.thread_path.split("_").pop();
            if (!joined.hasOwnProperty(id)) {
                var participants:IString = {};
                Object.values(conv.participants).forEach(function (someone:any) {

                    if (!Object.values(tempparticipants).includes(someone.name)) {
                        tempparticipants[Object.keys(tempparticipants).length] = someone.name;
                    }

                    participants[getKeyByValue(tempparticipants, someone.name)] = someone.name;
                });
                joined[id] = new ConvStats(conv.title, participants);
            }
            joined[id].addMsgs(conv.messages);
        });

        this.participants = tempparticipants;
        this.convs = Object.values(joined);
    }

    getCharCount(time:TimeRange = null) {
        var count:number = 0;
        this.convs.forEach(conv => {
            count += conv.getCountAll('char', time);
        });
        return count;
    }

    getWordCount(time:TimeRange = null) {
        var count:number = 0;
        this.convs.forEach(conv => {
            count += conv.getCountAll('msg', time);
        });
        return count;
    }

    getFullRange() {
        var temp_start:number, temp_end:number;

        var range:TimeRange = {
            min: Date.now(),
            max: 0
        }

        this.convs.forEach(conv => {

            temp_start = conv.getTimeFirst();
            temp_end = conv.getTimeLast();
            if (temp_start < range.min) {
                range.min = temp_start;
            }
            if (temp_end > range.max) {
                range.max = temp_end;
            }
        });

        return range;
    }

    toTable(time:TimeRange = null) {
        var alldata = [];
        this.convs.forEach((conv, index) => {
            var msgCount = conv.getCountAll("msg", time);
            if (msgCount > 0) {
                var dataConv = [];
                dataConv.push(index);
                dataConv.push(conv.getTitle());
                dataConv.push(msgCount);
                dataConv.push(conv.getAuthorCount());
                alldata.push(dataConv);
            }
        });
        return alldata;
    }

    get(conv:any) {
        return this.convs[conv];
    }

}

function FixStringValue(value:any) {
    switch (typeof value) {
      case 'string':
        return decodeURIComponent(escape(value));
      case 'object':
        var newObject = new Object()
        for (const attr in value) {
          newObject[attr] = FixStringValue(value[attr])
        }
        return newObject
      default:
        return value
    }
}

function readFile(file:any) {
    return new Promise((resolve, reject) => {
      var json = null;
      var fr = new FileReader();
      fr.onload = function (evt:any) {
        json = JSON.parse(evt.target.result);
        resolve(FixStringValue(json));
      }
      fr.onerror = reject;
      fr.readAsText(file, "UTF-8");
  
    });
  }
  
  function start(files:any): any{
  
    console.log('StartRead');
    var alljson = [];
    for (var i = 0, f; f = files[i]; i++) {
      if (files[i].webkitRelativePath.endsWith(".json")) {
        alljson.push(readFile(files[i]));
      }
    }
  
    return Promise.all(alljson);

  }

export { AllConvsStats, ConvStats, start as formatStats};
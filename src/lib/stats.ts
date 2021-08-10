import {IString, IValue, TimeRange, MediaKind} from './common';

// function replaceEmojis(txt:string){
//     var from = ['󾌴', '󾦇', '󾮟'];
//     var to = ['joy', 'beers', 'ok_hand'];

//     // var txtNew = '';
    
//     for (let i = 0; i < from.length; i++) {
//         txt = txt.replaceAll(from[i], ':'+to[i]+':');
//     }
//     return txt;
// }

type Conv ={
    is_still_participant: boolean;
    magic_words: any;
    messages: MsgList;
    participants: {[index:number]:{name: string}};
    thread_path: string;
    thread_type: string;
    title: string;
}

type Reaction = {
    reaction: string;
    actor: string;
}

type Share = {
    link: string;
}

type Msg = {
    sender_name: string;
    timestamp_ms: number;
    photos?: any[];
    content?: string;
    share?: Share;
    reactions?: Reaction[];
}

type MsgList = {[index: number] : Msg};


type MsgPhoto = [MediaKind.Photo, number];
type MsgVideo = [MediaKind.Video];
type MsgAudio = [MediaKind.Audio];
type MsgSticker = [MediaKind.Sticker];
type MsgGif = [MediaKind.Gif];

type MsgText = {char:number, word: number};
type Media = MsgPhoto | MsgVideo | MsgAudio | MsgSticker | MsgGif;

class MsgStat {
    readonly msgText?: MsgText;
    readonly msgShare?: boolean;
    readonly msgData?: Media;
    readonly reactionCount?: number;
    readonly author: number;

    constructor(msg: Msg, author: number) {
        this.author = author;
        if('content' in msg){
            this.msgText = {
                char: msg.content.length,
                word: msg.content.split(' ').length
            }

            if('share' in msg){
                this.msgShare = true;
            }
        }

        if('reactions' in msg){
            this.reactionCount = msg.reactions.length;
        }
        
        if('sticker' in msg){
            this.msgData = [MediaKind.Gif];
        } else if('photos' in msg){
            this.msgData = [MediaKind.Photo, msg.photos.length];
        } else if('audio_files' in msg){
            this.msgData = [MediaKind.Audio];
        } else if('gifs' in msg){
            this.msgData = [MediaKind.Gif];
        } else if('videos' in msg){
            this.msgData = [MediaKind.Video];
        }

    }

    getMedia(){
        return this.msgData[0];
    }

    getReactionCount(){
        return this.reactionCount;
    }

    getPhotoCount(){
        return this.msgData[1];
    }

    getCharCount() {
        return this.msgText.char;
    }

    getWordCount() {
        return this.msgText.word;
    }

    getAuthor() {
        return this.author;
    }

    getAuthorName(list: string[]) {
        return list[0];
    }

    isAuthor(test: number) {
        return test === this.author;
    }

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

    addMsgs(msgs: MsgList) {
        var self = this;
        Object.values(msgs).forEach(function(msg) {
            let author = getKeyByValue(self.participants, msg.sender_name);
            if (author != undefined) {
                self.msgs[msg.timestamp_ms] = new MsgStat(msg, author);
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

function getKeyByValue(object, value: number|string):number {
    return Object.keys(object).find(key => object[key] === value) as unknown as number;;
}

class AllConvsStats {
    readonly participants: IString;
    readonly convs: ConvStats[];

    constructor(convs: Conv[]) {
        convs = convs.filter(function (conv) {
            return conv.hasOwnProperty('thread_type') && conv.thread_type.startsWith("Regular");
        });

        console.log(convs);

        var joined:{[index: string]: ConvStats} = {};

        var tempparticipants:IString = {};

        convs.forEach(function (conv) {
            var id = conv.thread_path.split("_").pop();
            if (!joined.hasOwnProperty(id)) {
                var participants:IString = {};
                Object.values(conv.participants).forEach(function (someone) {

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
            var newObject: Object;
            if(Array.isArray(value)){
                newObject = new Array();
            } else{
                newObject = new Object();
            }
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
  
  function start(files:any){
  
    console.log('StartRead');
    var alljson = [];
    for (var i = 0, f; f = files[i]; i++) {
      if (files[i].webkitRelativePath.endsWith(".json")) {
        alljson.push(readFile(files[i]));
      }
    }
  
    return Promise.all(alljson);

  }

export { AllConvsStats as AllConvData, ConvStats as OneConvData, start as formatStats};
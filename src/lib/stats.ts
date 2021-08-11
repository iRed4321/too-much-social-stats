import {IString, IValue, TimeRange, MediaKind, MsgTextProp} from './common';

// function replaceEmojis(txt:string){
//     var from = ['󾌴', '󾦇', '󾮟'];
//     var to = ['joy', 'beers', 'ok_hand'];

//     // var txtNew = '';
    
//     for (let i = 0; i < from.length; i++) {
//         txt = txt.replaceAll(from[i], ':'+to[i]+':');
//     }
//     return txt;
// }

class SuperMap<MediaKind> extends Map<MediaKind, number> {

    add(key:MediaKind, value:number) {
        super.has(key) && super.set(key, super.get(key) + value)
    }

    del(key:MediaKind, value:number) {
        super.has(key) && super.set(key, super.get(key) - value)
    }
}

type Conv ={
    is_still_participant: boolean;
    magic_words: any;
    messages: MsgList;
    participants: {[index:number]:{name: string}};
    thread_path: string;
    thread_type: string;
    title: string;
}

type ReactionOriginal = {
    reaction: string;
    actor: string;
}


type Share = {
    link: string;
}

type MsgOriginal = {
    sender_name: string;
    timestamp_ms: number;
    photos?: any[];
    content?: string;
    share?: Share;
    reactions?: ReactionOriginal[];
}

type MsgList = {[index: number] : MsgOriginal};

type MsgText = {
    [MsgTextProp.Char]: number,
    [MsgTextProp.Word]: number,
};

class MsgStat {
    // readonly msgText?: MsgText;
    // readonly msgShare?: boolean;
    // readonly media?: Media;
    readonly msgData: Map<MediaKind, number>;
    readonly reactionCount?: number;
    readonly author: number;

    constructor(msg: MsgOriginal, author: number) {
        this.author = author;
        this.msgData = new Map();

        if('content' in msg){
            this.msgData.set(MediaKind.Text, 1);
        }
        if('reactions' in msg){
            this.msgData.set(MediaKind.Reaction, msg.reactions.length);
        }
        
        if('sticker' in msg){
            this.msgData.set(MediaKind.Sticker, 1);
        } else if('photos' in msg){
            this.msgData.set(MediaKind.Photo, msg.photos.length);
        } else if('audio_files' in msg){
            this.msgData.set(MediaKind.Audio, 1);
        } else if('gifs' in msg){
            this.msgData.set(MediaKind.Gif, 1);
        } else if('videos' in msg){
            this.msgData.set(MediaKind.Video, 1);
        }

    }

    getData(){
        return this.msgData;
    }


    getReactionCount(){
        return this.reactionCount;
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

    getCount(time:TimeRange, what:MediaKind[]) {
        var count:{[index: number]: SuperMap<MediaKind>};

        count = {};

        Object.keys(this.getAuthors()).forEach(author => {
            count[author] = new SuperMap();
        });

        if (time == null) {
            for (const timestamp in this.msgs) {
                var values = this.msgs[timestamp].getData();
                var self = this;
                what.forEach(function(type){
                    if(values.has(type)){
                        if(count[self.msgs[timestamp].getAuthor()].has(type)){
                            count[self.msgs[timestamp].getAuthor()].add(type, values.get(type));
                        } else{
                            count[self.msgs[timestamp].getAuthor()].set(type, values.get(type));
                        }
                    }
                });
            }
        } else {
            for (const timestamp in this.msgs) {
                const tp = timestamp as unknown as number;
                if (tp > time.min && tp < time.max) {
                    var values = this.msgs[timestamp].getData();
                    var self = this;
                    what.forEach(function(type){
                        if(values.has(type)){
                            if(count[self.msgs[timestamp].getAuthor()].has(type)){
                                count[self.msgs[timestamp].getAuthor()].add(type, values.get(type));
                            } else{
                                count[self.msgs[timestamp].getAuthor()].set(type, values.get(type));
                            }
                        }
                    });
                }
            }
        }

        return count;

    }

    getCountAll(time:TimeRange, what:MediaKind[]){
        var count = Object.values(this.getCount(time, what));
        var totalCount = new SuperMap<MediaKind>();
        what.forEach(type => {
            totalCount.set(type, 0);
            count.forEach(person => {
                if(person.has(type)){
                    totalCount.add(type, person.get(type));
                }
            });
        });
        return totalCount;
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

    toTable(options:MediaKind[], time:TimeRange = null) {
        var alldata = [];
        this.convs.forEach((conv, index) => {
            var msgCount = conv.getCountAll(time, options);
            var total = 0;
            options.forEach(kind => {
                if(msgCount.has(kind)){
                    total+= msgCount.get(kind);
                }
            });
            if (total > 0) {
                var dataConv = [];
                dataConv.push(index);
                dataConv.push(conv.getTitle());
                dataConv.push(total);
                dataConv.push(conv.getAuthorCount());
                alldata.push(dataConv);
            }
        });
        return alldata;
    }

    get(conv:any) {
        return this.convs[conv];
    }

    // getCount(time: TimeRange, ...types: MediaKind[]){
        
    // }

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
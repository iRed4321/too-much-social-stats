type IString = {[index: number]:string};
type IValue = {[index: number]:number};
type TimeRange = {
    min: number,
    max: number
}

enum Conv{
    ONE,
    ALL,
    ANY
}

enum Main{
    First,
    Second
}  

enum Tab {
    Main,
    Conv,
}

type ViewMain = [Tab.Main, Main]
type ViewConv = [Tab.Conv, Conv]
type View = ViewMain | ViewConv;

type Action = {
    view?: View;
    data?: any;
    type?: string;
}

enum Dir{
    ASC,
    DESC
}

type SortKind = {
    col: number;
    order: Dir;
}

function addDiv(to, from) {
    var div = document.createElement("div");
    div.id = from;
    document.getElementById(to).appendChild(div);
}

type Photo = {
    uri: string;
    creation_timestamp:number;
}

type Video = {
    uri: string,
    creation_timestamp: number,
    thumbnail: {
        uri: string
    }
}

type Gif = {
    uri: string;
}

type Audio = {
    uri: string;
    creation_timestamp:number;
}

type Text = string;

type Sticker = {
    uri: string;
}


// type MsgKind = Sticker | Audio[] | Gif[] | Video[] | Photo[] | Text;
enum MediaKind {
    Sticker,
    Audio,
    Gif,
    Video,
    Photo,
}

export {
    IString,
    IValue,
    TimeRange,
    Action,
    View, Main, Conv, Tab,
    SortKind, Dir,
    addDiv,
    MediaKind
}
import { ConvOne } from "./ConvOne";

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
    Main = 'main',
    Conv = 'conv',
}


type ViewMain = [Tab.Main, Main]

type ViewConv = [Tab.Conv, Conv]

type View = ViewMain | ViewConv;



type Action = {
    view: View;
    data: any;
    type: string;
}


export {
    IString,
    IValue,
    TimeRange,
    Action,
    View, Main, Conv, Tab
}
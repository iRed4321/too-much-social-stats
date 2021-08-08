type IString = {[index: number]:string};
type IValue = {[index: number]:number};
type TimeRange = {
    min: number,
    max: number
}

enum Conv{
    ONE,
    ALL
}

enum Tab{
    Conv = 'CONV',
    Main = 'MAIN'
}

// type View = {
//     [Tab.Conv: Conv | [Tab.Main] : string
// }

type Action = {

}


export {
    IString,
    IValue,
    TimeRange,
    Action
}
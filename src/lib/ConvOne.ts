import { Action, Tab, Conv, addDiv, MediaKind } from "./common";
import { OneConvData } from "./stats";
import { TimeRange } from "./common";

// function sortItems(arrayLabel, arrayData) {

//     arrayLabel = Object.values(arrayLabel);
//     arrayData = Object.values(arrayData);
//     arrayOfObj = arrayLabel.map(function (d, i) {
//       return {
//         label: d,
//         data: arrayData[i] || 0
//       };
//     });
  
//     sortedArrayOfObj = arrayOfObj.sort(function (a, b) {
//       return b.data > a.data;
//     });
  
//     newArrayLabel = [];
//     newArrayData = [];
//     sortedArrayOfObj.forEach(function (d) {
//       newArrayLabel.push(d.label);
//       newArrayData.push(d.data);
//     });
//     return [newArrayLabel, newArrayData];
// }


class ConvOne{

    conv: OneConvData;

    constructor(){
        this.conv = null;
    }

    setRow(conv:OneConvData){
        this.conv = conv;
    }

    getUpdate(){
        return new Promise<Action>(function (resolve) {
            if(false){
                var action : Action = {
                    type: 'upTimeRange',
                    view: [Tab.Conv, Conv.ANY] 
                };
                resolve(action);
            }
        });
    }

    display(filters: MediaKind[], time:TimeRange){

        addDiv('root', 'oneMsgGrid');
        addDiv('oneMsgGrid', 'timeRange');
        addDiv('timeRange', 'slider');
        // addDiv('oneMsgGrid', 'convStats');
        // addDiv('convStats', 'convGraphs');

        var stats = this.conv.getCount(time, filters);
        var people = this.conv.getPeopleProperties();
        
        console.log(people);
        console.log(stats);

        var sorted;
        
        // sorted = sortItems(people, stats, MediaKind.Photo);
        // console.log(sorted);
        // makeGraph(sorted[0], sorted[1], 'Messages count');
      
        // sorted = sortItems(people, stats.words);
        // makeGraph(sorted[0], sorted[1], 'Words count');
      
        // sorted = sortItems(people, stats.chars);
        // makeGraph(sorted[0], sorted[1], 'Characters count');
      
        // stats.wordsByMsg = {};
        // Object.keys(stats.words).forEach(element => {
        //   stats.wordsByMsg[element] = stats.words[element]/stats.msgs[element];
        // });
      
        // sorted = sortItems(people, stats.wordsByMsg);
        // makeGraph(sorted[0], sorted[1], 'Words by msg');
    }


}

export {ConvOne};
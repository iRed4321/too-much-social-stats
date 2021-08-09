import { Action, Conv, Tab} from "./common";

class ConvAll{
    getUpdate(){
        return new Promise<Action>(function (resolve) {
            var action : Action = {
                type: 'upTimeRange',
                data: null,
                view: [Tab.Conv, Conv.ANY] 
            };
            resolve(action);
        });
    }
}

export {ConvAll};
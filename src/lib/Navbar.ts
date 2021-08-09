import { Action, Tab, Conv } from "./common";

class Navbar{
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

export {Navbar}
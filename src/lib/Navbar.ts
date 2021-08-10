import { Action, Tab, Conv } from "./common";

class Navbar{
    getUpdate(){
        return new Promise<Action>(function (resolve) {
            document.getElementById('navConversations').addEventListener('click', function(){
                resolve({
                    view: [Tab.Conv, Conv.ALL] 
                });
            })
        });
    }
}

export {Navbar}
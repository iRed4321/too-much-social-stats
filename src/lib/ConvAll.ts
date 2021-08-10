import { Grid } from "gridjs";
import { Action, Conv, Tab, SortKind, Dir} from "./common";

class ConvAll{
    grid: Grid;
    config: any;
    sort: SortKind;

    constructor(alldata: any[]){
        this.config = {
            columns: [
              { name: 'conv_id', hidden: true },
              'Title',
              'Messages',
              'Participants'
            ],
            data: alldata,
            pagination: {
              enabled: true,
              limit: 19,
              summary: false
            },
            sort: true,
            search: {
              enabled: true,
              keyword: ''
            }
        };
        
        this.sort = {col: 1, order: Dir.DESC};
    }

    updateData(alldata: any[]){
        this.config.data = alldata;
    }

    display(){
        var container = document.getElementById("convTable");
        this.grid = new Grid(this.config);
        this.grid.render(container);
        container.querySelectorAll('*').forEach(function (node) {
          node.removeAttribute('style');
        });
      
        var head: HTMLElement = document.getElementsByClassName("gridjs-th")[this.sort.col] as HTMLElement;
        head.click();
        if (this.sort.order == Dir.DESC) {
          head.click();
        }
    }

    getUpdate(){
        var self = this;
        return new Promise<Action>(function (resolve) {
            self.grid.on('rowClick', (...args) => {
                resolve({
                    type: 'clickRow',
                    data: args[1].cells[0].data,
                    view: [Tab.Conv, Conv.ONE] 
                });
              });

        });
    }
}

export {ConvAll};
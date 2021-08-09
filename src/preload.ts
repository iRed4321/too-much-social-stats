import {formatStats, AllConvData, OneConvData} from './lib/stats';
import { ConvAll } from './lib/ConvAll';
import { ConvOne } from './lib/ConvOne';
import { TimeSlider } from './lib/TimeSlider';
import { Action, Conv, Tab } from './lib/common';

class ActionLoop{
  objects:{
    slider: TimeSlider,
    convAll: ConvAll,
    convOne: ConvOne
  };
  action: Action;
  root: HTMLElement = document.getElementById('root');
  convs: AllConvData;
  constructor(convs: AllConvData){
    this.convs = convs;
    this.objects = {
      slider: new TimeSlider(convs.getFullRange()),
      convAll: new ConvAll(),
      convOne: new ConvOne()
    }
    this.action = {
      type: 'none',
      data: null,
      view: [Tab.Conv, Conv.ALL]
    }

  }

  clear(elem:HTMLElement){
    elem.textContent = '';
  }

  update(){
    switch (this.action.type) {
      case 'upTimeRange':
        // this.objects.convAll.updateData(this.convs.toTable(this.objects.slider.currRange));
        break;
    
      default:
        break;
    }
  }

  displayConv(){
    switch (this.action.view[1]) {
      case Conv.ALL:
        break;
      
      case Conv.ONE:
        break;
    
    }
  }

  display(){
    switch(this.action.view[0]){

      case Tab.Conv:
        this.displayConv();

        break;
    }
  }

  getAnyAction(){
    var updaters: Promise<Action>[];
    Object.values(this.objects).forEach(obj => {
      updaters.push(obj.getUpdate());
    });

    return new Promise<Action>(function (resolve){
      Promise.race(updaters).then(function(action:Action){
        resolve(action);
      });
    })
  }

  async run(){
    this.clear(this.root);
    this.update();
    this.display();
    var newAction = await this.getAnyAction();
    if(newAction.view[1] == Conv.ANY){
      newAction.view = this.action.view;
    }
    this.action = newAction;
    this.run();
  }

}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById('import').addEventListener('click', function (event) {
    document.getElementById("filepicker").click();
  })

  document.getElementById('DarkModeToogle').addEventListener('change', function (event) {
    var element = document.body;
    element.classList.toggle("dark-mode");
  })

  document.getElementById("filepicker").addEventListener("change", function (event:any) {

    formatStats(event.target.files).then((values) => {
      var loop = new ActionLoop(new AllConvData(values));
      loop.run();
    });
  }, false);
});

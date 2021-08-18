import {formatStats, AllConvData, OneConvData} from './lib/stats';
import { ConvAll } from './lib/ConvAll';
import { FilterFields } from './lib/FilterFields';
import { ConvOne } from './lib/ConvOne';
import { TimeSlider } from './lib/TimeSlider';
import { Action, Conv, Tab, addDiv, MediaKind } from './lib/common';
import { Navbar } from './lib/Navbar';



class ActionLoop{
  objects:{
    filters: FilterFields,
    slider: TimeSlider,
    convAll: ConvAll,
    navBar: Navbar,
    convOne: ConvOne
  };
  action: Action;
  root: HTMLElement = document.getElementById('root');
  convs: AllConvData;
  constructor(convs: AllConvData){
    this.convs = convs;
    this.objects = {
      filters: new FilterFields(),
      slider: new TimeSlider(convs.getFullRange()),
      convAll: new ConvAll(convs.toTable(
        [
        MediaKind.Audio,
        MediaKind.Gif,
        MediaKind.Photo,
        MediaKind.Sticker,
        MediaKind.Text,
        MediaKind.Video
        ]
      )),
      navBar: new Navbar(),
      convOne: new ConvOne()
    }
    this.action = {
      view: [Tab.Conv, Conv.ALL]
    }
    console.log('init finished');

  }

  clear(elem:HTMLElement){
    elem.textContent = '';
  }

  update(){
    switch (this.action.type) {
      case 'updateData':
        this.objects.convAll.updateData(this.convs.toTable(this.objects.filters.get(), this.objects.slider.getCurrRange()));
        break;

      case 'clickRow':
        this.objects.convOne.setRow(this.convs.get(this.objects.convAll.getSelectedRow()));
        break;
        
      default:
        break;
    }
  }

  displayConv(){
    
    switch (this.action.view[1]) {
      case Conv.ALL:
        addDiv('root', 'convTable');
        this.objects.convAll.display();
        break;
      
      case Conv.ONE:
        this.objects.convOne.display(this.objects.filters.get(), this.objects.slider.getCurrRange());
        break;
    }
    this.objects.slider.display();
    this.objects.filters.display();
  }

  display(){
    switch(this.action.view[0]){

      case Tab.Conv:
        this.displayConv();

        break;
    }
  }

  getAnyAction(){
    var updaters: Promise<Action>[] = [];
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

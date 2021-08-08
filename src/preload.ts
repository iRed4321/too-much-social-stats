import {formatStats, AllConvData, OneConvData} from './lib/stats';
import { ConvAll } from './lib/ConvAll';
import { ConvOne } from './lib/ConvOne';
import { TimeSlider } from './lib/TimeSlider';
import { Action } from './lib/common';

class ActionLoop{
  objects:{
    slider: TimeSlider,
    convAll: ConvAll,
    convOne: ConvOne
  };
  action: Action;
  constructor(convs: AllConvData){
    convs.getFullRange();
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

    Promise.all(formatStats(event.target.files)).then((values) => {
      var loop = new ActionLoop(new AllConvData(values));
      // loop.run();
    });
  }, false);
});

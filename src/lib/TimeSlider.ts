import { TimeRange } from "./common";
import wNumb from "wnumb";
import noUiSlider, { target } from "nouislider";
import { Action, Tab, View, Conv, addDiv} from "./common";


class TimeSlider {
    slider: target;
    config: any;
    constructor(range: TimeRange) {
        this.slider = null;
        this.config = {
            range: {
                min: parseInt(""+range.min),
                max: parseInt(""+range.max)
            },
            step: 7 * 24 * 60 * 60 * 1000,
            start: [range.min, range.max],
            connect: true,
            tooltips: true,
            format: wNumb({
                decimals: 0,
            }),
        }
    }

    getCurrRange(){
        return {min: this.config.start[0], max:this.config.start[1]} as TimeRange;
    }

    setCurrRange(values: [number, number] | TimeRange){
        if('min' in values){
            this.config.start[0] = values.min;
            this.config.start[1] = values.max;
        } else{
            this.config.start = values;
        }
    }

    getUpdate() {
        var self = this;
        return new Promise<Action>(function (resolve) {
            self.slider.noUiSlider.on('set', function (values:[number, number]) {
                self.setCurrRange(values);
                var action : Action = {
                    type: 'upTimeRange',
                    data: self.getCurrRange(),
                    view: [Tab.Conv, Conv.ANY] 
                };
                resolve(action);
              });
        });
    }

    display() {
        if(document.getElementById("slider") == null){
            var div = document.createElement('div');
            div.id = 'timeRange';
            var container = document.getElementsByClassName("gridjs-container")[0];
            container.prepend(div);
            addDiv('timeRange', 'slider');
        }

        this.slider = document.getElementById("slider");

        noUiSlider.create(this.slider, this.config);

        var dateValues = Array.from(
            document.getElementsByClassName("noUi-tooltip")
        );

        this.slider.noUiSlider.on("update", function (values, handle) {
            dateValues[handle].innerHTML = formatDate(
                new Date(+values[handle])
            );
        });
    }
}

export { TimeSlider };

function formatDate(date) {
    var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    function nth(d) {
        if (d > 3 && d < 21) return "th";
        switch (d % 10) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }

    return (
        date.getDate() +
        nth(date.getDate()) +
        " " +
        months[date.getMonth()] +
        " " +
        date.getFullYear()
    );
}

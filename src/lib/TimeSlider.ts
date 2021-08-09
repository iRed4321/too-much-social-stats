import { TimeRange } from "./common";
import wNumb from "wnumb";
import noUiSlider, { target } from "nouislider";
import { Action, Tab, View, Conv } from "./common";


class TimeSlider {
    fullRange: TimeRange;
    currRange: TimeRange;
    slider: target;
    constructor(range: TimeRange) {
        this.fullRange = range;
        this.currRange = range;
        this.slider = document.getElementById("slider");
    }

    getUpdate() {
        return new Promise<Action>(function (resolve) {
                var action : Action = {
                    type: 'upTimeRange',
                    data: this.currRange,
                    view: [Tab.Conv, Conv.ANY] 
                };
                resolve(action);
        });
    }

    display() {
        noUiSlider.create(this.slider, {
            range: this.fullRange,
            step: 7 * 24 * 60 * 60 * 1000,
            start: [this.currRange.min, this.currRange.max],
            connect: true,
            tooltips: true,
            format: wNumb({
                decimals: 0,
            }),
        });

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

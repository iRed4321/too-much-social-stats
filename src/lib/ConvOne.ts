import { Action, Tab, Conv, addDiv, MsgAllKind } from "./common";
import { OneConvData } from "./stats";
import { TimeRange } from "./common";
import { Chart } from "chart.js";

function sortItems(arrayLabel, arrayData) {
    arrayLabel = Object.values(arrayLabel);
    arrayData = Object.values(arrayData);
    var arrayOfObj = arrayLabel.map(function (d, i) {
        return {
            label: d,
            data: arrayData[i] || 0,
        };
    });

    var sortedArrayOfObj = arrayOfObj.sort(function (a, b) {
        return b.data > a.data;
    });

    var newArrayLabel = [];
    var newArrayData = [];
    sortedArrayOfObj.forEach(function (d) {
        newArrayLabel.push(d.label);
        newArrayData.push(d.data);
    });
    return [newArrayLabel, newArrayData];
}

function makeGraph(people, rawdata, label, type = "pie") {
    const labels = people.map((a) => a.name);
    const colors = people.map((a) => a.color);

    const data = {
        labels: labels,
        datasets: [
            {
                label: label,
                data: rawdata,
                backgroundColor: colors,
            },
        ],
    };

    const config: any = {
        type: type,
        data,
        options: {
            maintainAspectRatio: true,
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    };

    var newCanvas = document.createElement("canvas");
    var canContainer = document.createElement("div");

    canContainer.appendChild(newCanvas);
    document.getElementById("convStats").appendChild(canContainer);

    new Chart(newCanvas, config);
}

class ConvOne {
    conv: OneConvData;

    constructor() {
        this.conv = null;
    }

    setRow(conv: OneConvData) {
        this.conv = conv;
    }

    getUpdate() {
        return new Promise<Action>(function (resolve) {
            if (false) {
                var action: Action = {
                    type: "upTimeRange",
                    view: [Tab.Conv, Conv.ANY],
                };
                resolve(action);
            }
        });
    }

    display(filters: MsgAllKind[], time: TimeRange) {
        addDiv("root", "oneMsgGrid");
        addDiv("oneMsgGrid", "timeRange");
        addDiv("timeRange", "slider");
        addDiv("oneMsgGrid", "convStats");

        var stats = this.conv.getCount(time, filters);
        var people = this.conv.getPeopleProperties();
        var statSum = [];
        Object.keys(stats).forEach((person) => {
            statSum[person] = Array.from(stats[person].values()).reduce(
                (x: number, y: number) => x + y,
                0
            );
        });

        var sorted;

        sorted = sortItems(people, statSum);
        makeGraph(sorted[0], sorted[1], "Messages count");
    }
}

export { ConvOne };

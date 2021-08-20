import { MsgDataKind, Action, Tab, Conv } from "./common";

type Filter = {
    id: string,
    label: string,
    state: boolean
}

class FilterFields{
    filters: Map<MsgDataKind, Filter>

    constructor(){
        this.filters = new Map<MsgDataKind, Filter>([
            [MsgDataKind.Audio, {
                id: 'filt_Audio',
                label: 'Audio messages',
                state: true
            }],
            [MsgDataKind.Gif, {
                id: 'filt_Gif',
                label: 'Gifs',
                state: true
            }],
            [MsgDataKind.Photo, {
                id: 'filt_Photo',
                label: 'Pictures',
                state: true
            }],
            [MsgDataKind.Reaction, {
                id: 'filt_Reaction',
                label: 'Reactions',
                state: false
            }],
            [MsgDataKind.Sticker, {
                id: 'filt_Sticker',
                label: 'Stickers',
                state: true
            }],
            [MsgDataKind.Text, {
                id: 'filt_Text',
                label: 'Classic text messages',
                state: true
            }],
            [MsgDataKind.Video, {
                id: 'filt_Video',
                label: 'Videos',
                state: true
            }]
        ]);
    }

    display(){
        var ui = document.createElement('div');
        ui.id = 'filtersFields';
        var stringhtml = '';
        this.filters.forEach(function(value){
            stringhtml += '<div><input type="checkbox" id="' + value.id + '" name="filter"';
            if(value.state){
                stringhtml +=' checked';
            }
            stringhtml += '><label for="'+value.id+'">'+value.label+'</label></div>';

        });
        ui.innerHTML = stringhtml;
        var container = document.getElementsByClassName("gridjs-container")[0];
        if(container == undefined){
            container = document.getElementById('oneMsgGrid');
        }
        container.appendChild(ui);
    }

    get(){
        var kinds: MsgDataKind[] = [];

        this.filters.forEach((value, key) => {
            if(value.state){
                kinds.push(key);
            }
        });
        return kinds;
    }

    getUpdate(){
        var self = this;
        return new Promise<Action>(function (resolve) {

            self.filters.forEach((value, key) => {
                var checkbox = document.getElementById(value.id) as HTMLInputElement;
                checkbox.addEventListener('change', function() {
                    value.state = checkbox.checked;
                    resolve({
                        type: 'updateData',
                        view: [Tab.Conv, Conv.ANY]
                    });
                })
                
            })
        });

    }
}

export {FilterFields}
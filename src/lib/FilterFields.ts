import { MediaKind, Action, Tab, Conv } from "./common";

type Filter = {
    id: string,
    label: string,
    state: boolean
}

class FilterFields{
    filters: Map<MediaKind, Filter>

    constructor(){
        this.filters = new Map<MediaKind, Filter>([
            [MediaKind.Audio, {
                id: 'filt_Audio',
                label: 'Audio messages',
                state: true
            }],
            [MediaKind.Gif, {
                id: 'filt_Gif',
                label: 'Gifs',
                state: true
            }],
            [MediaKind.Photo, {
                id: 'filt_Photo',
                label: 'Pictures',
                state: true
            }],
            [MediaKind.Reaction, {
                id: 'filt_Reaction',
                label: 'Reactions',
                state: false
            }],
            [MediaKind.Sticker, {
                id: 'filt_Sticker',
                label: 'Stickers',
                state: true
            }],
            [MediaKind.Text, {
                id: 'filt_Text',
                label: 'Classic text messages',
                state: true
            }],
            [MediaKind.Video, {
                id: 'filt_Video',
                label: 'Videos',
                state: true
            }]
        ]);
    }

    display(){
        var container = document.getElementsByClassName("gridjs-container")[0];
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
        container.appendChild(ui);
    }

    get(){
        var kinds: MediaKind[] = [];

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
                        data: self.filters,
                        view: [Tab.Conv, Conv.ANY]
                    });
                })
                
            })
        });

    }
}

export {FilterFields}
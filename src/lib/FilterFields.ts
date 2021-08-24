import { MsgKind, MsgTextKind, Action, Tab, Conv, MsgAllKind } from "./common";

type Filter = {
    id: string,
    label: string,
    state: boolean,
    txtKind?: Map<MsgTextKind, Filter>
}

class FilterFields{
    filters: Map<MsgKind, Filter>

    constructor(){
        this.filters = new Map<MsgKind, Filter>([
            [MsgKind.Audio, {
                id: 'filt_Audio',
                label: 'Audio messages',
                state: true
            }],
            [MsgKind.Gif, {
                id: 'filt_Gif',
                label: 'Gifs',
                state: true
            }],
            [MsgKind.Photo, {
                id: 'filt_Photo',
                label: 'Pictures',
                state: true
            }],
            [MsgKind.Reaction, {
                id: 'filt_Reaction',
                label: 'Reactions',
                state: false
            }],
            [MsgKind.Sticker, {
                id: 'filt_Sticker',
                label: 'Stickers',
                state: true
            }],
            [MsgKind.Message, {
                id: 'filt_Message',
                label: 'Text :',
                state: true,
                txtKind: new Map<MsgTextKind, Filter>([
                    [MsgTextKind.Full, {
                        id: 'filt_Message_Full',
                        label: 'Message',
                        state: true
                    }],
                    [MsgTextKind.Word, {
                        id: 'filt_Message_Word',
                        label: 'Words',
                        state: false
                    }],
                    [MsgTextKind.Char, {
                        id: 'filt_Message_Char',
                        label: 'Characters',
                        state: false
                    }]
                ])
            }],
            [MsgKind.Video, {
                id: 'filt_Video',
                label: 'Videos',
                state: true
            }],
            [MsgKind.File, {
                id: 'filt_File',
                label: 'File',
                state: true
            }]
        ]);
    }

    display(){
        var ui = document.createElement('div');
        ui.id = 'filtersFields';
        var stringhtml = '<div><input type="checkbox" id="Text" name="filter"';

        this.filters.forEach(function(value, key){
            stringhtml += '<div><input type="checkbox" id="' + value.id + '" name="filter"';
            if(value.state === true){
                stringhtml +=' checked';
            }

            stringhtml += '><label for="'+value.id+'"> ' + value.label;

            if(key == MsgKind.Message){
                stringhtml += '<select id="textOption">';
                value.txtKind.forEach((countMethod) => {
                    stringhtml += '<option value="'+countMethod.id+'"';
                    if(countMethod.state === true){
                        stringhtml +=' selected';
                    }
                    stringhtml+='>'+countMethod.label+'</option>';
                });
                stringhtml+='</select>'
            }
            stringhtml+='</label></div>';

        });
        ui.innerHTML = stringhtml;
        var container = document.getElementsByClassName("gridjs-container")[0];
        if(container == undefined){
            container = document.getElementById('oneMsgGrid');
        }
        container.appendChild(ui);
    }

    get(){
        var kinds: MsgAllKind[] = [];

        this.filters.forEach((value, key) => {
            if(value.state){
                if('txtKind' in value){
                    value.txtKind.forEach((subvalue, subKey) => {
                        if(subvalue.state){
                            kinds.push(subKey);
                        }
                    })
                } else{
                    kinds.push(key);
                }
            }
        });
        return kinds;
    }

    getUpdate(){
        var self = this;
        return new Promise<Action>(function (resolve) {
            var select = document.getElementById("textOption") as HTMLInputElement;
            select.addEventListener('change', (event:any) => {
                self.filters.get(MsgKind.Message).txtKind.forEach(countMethod => {
                    countMethod.state = false;
                    if(countMethod.id == event.target.value){
                        countMethod.state = true;
                    }
                });
                resolve({
                    type: 'updateData',
                    view: [Tab.Conv, Conv.ANY]
                });
            });

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
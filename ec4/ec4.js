"use strict";
let isDirty = false;
let allData = new Uint8Array(50240);
const lengthGroup = 192;
const lengthSetup = lengthGroup*16;
const dataOffset = 0x1BC0;
const addrSetupNames = dataOffset - dataOffset;
const addrGroupNames = 0x1C00 - dataOffset;
const addrPresets = 0x2000 - dataOffset;
let clipboardDataGroup;
const clipboardDataSetup = {
    groupNames: undefined,
    setupData: undefined
};

class Selection {

    constructor(updatecallback) {
        this.s = 0;
        this.g = 0;
        this.e = 0;
        this.updatecallback = updatecallback;
    }

    setAll(setup, group, encoder) {
        this.s = setup;
        this.g = group;
        this.e = encoder;
        this.updatecallback(this);
    }

    get setup() {
        return this.s;
    }

    set setup(n) {
        const v = parseInt(n);
        if (v!==this.s) {
            this.s = v;
            this.updatecallback(this);
        }
    }

    get group() {
        return this.g;
    }

    set group(n) {
        this.g = parseInt(n);
        this.updatecallback(this);
    }

    get encoder() {
        return this.e;
    }

    set encoder(n) {
        this.e = parseInt(n);
        this.updatecallback(this);
    }

}


const P = { // P is short for Parameter
    type: 'type', channel: 'channel', number: 'number',
    number_h: 'number_h', lower: 'lower', upper: 'upper', 
    mode: 'mode', scale: 'scale', name: 'name',

    labels: {
        type: 'Type', channel: 'Channel', number: 'Number',
        number_h: 'Number', lower: 'Lower', upper: 'Upper',
        mode: 'Mode', scale: 'Display'
    },

    $type: { pos: 0, mask: 0xf0, min: 0, max: 8, default: 2 },
    $channel: { pos: 0, mask: 0x0f },
    $number: { pos: 16, mask: 0xff },
    $number_h: { pos: 32, mask: 0xff },
    $lower: { pos: 48, mask: 0xff },
    $upper: { pos: 64, mask: 0xff },
    $mode: { pos: 80, mask: 0xf0, min: 0, max: 3, default: 3 },
    $scale: { pos: 80, mask: 0x0f, min: 0, max: 7, default: 1 },
    $name: { pos: 128 },

    get: function(setup, group, encoder, type) {
        const spec = P['$'+type];
        if (!spec) {
            console.log('Unknown parameter type '+type);
            return;
        }
        let addr = addrPresets + (setup*16 + group)*lengthGroup + spec.pos;
        if (type === P.name) {
            addr += encoder*4;
            return String.fromCharCode(allData[addr+0], allData[addr+1], allData[addr+2], allData[addr+3]);
        } else {
            addr += encoder;
            if (spec.mask!=0xff) {
                let val = allData[addr] & spec.mask;
                if (spec.mask>0x0f) {
                    val = val>>4;
                }
                if (spec.hasOwnProperty('min')) {
                    if (val<spec.min || val>spec.max) {
                        val = spec.default;
                    }
                }
                if (type === P.channel) val++;
                return val;
            } else {
                return allData[addr];
            }
        }
    },
    set: function(setup, group, encoder, type, value) {
        const spec = P['$'+type];
        if (!spec) {
            console.log('Unknown parameter type: '+type);
            return;
        }
        let addr = addrPresets + (setup*16 + group)*lengthGroup + spec.pos;
        if (type === P.name) {
            addr += encoder*4;
            while (value.length<4) { value += ' '; }
            for (let i=0; i<4; i++) {
                const oldValue = allData[addr+i];
                allData[addr+i] = value.charCodeAt(i);
                isDirty = isDirty | allData[addr+i]!=oldValue;
            }
        } else {
            const oldValue = allData[addr];
            addr += encoder;
            value = parseInt(value);
            if (type === P.channel) value--;
            if (spec.mask!=0xff) {
                if (spec.mask>0x0f) {
                        value = (value & 0x0f)<<4;
                        allData[addr] = (allData[addr] & 0x0f) | value;
                } else {
                    allData[addr] = (allData[addr] & 0xf0) | value;
                }
            } else {
                value = value & spec.mask;
                allData[addr] = value;
            }
            isDirty = isDirty | allData[addr]!=oldValue;
        }
    },
    setSetupName: function(setupNumber, name) {
        while (name.length<4) { name += ' '; }
        const addr = addrSetupNames + setupNumber*4;
        for (let i=0; i<4; i++) {
            allData[addr+i] = name.charCodeAt(i);
        }
    },
    setGroupName: function(setupNumber, groupNumber, name) {
        while (name.length<4) { name += ' '; }
        const addr = addrGroupNames + setupNumber*64 + groupNumber*4;
        for (let i=0; i<4; i++) {
            allData[addr+i] = name.charCodeAt(i);
        }
    },
    getGroupName: function(setupNumber, groupNumber) {
        const addr = addrGroupNames + setupNumber*64 + groupNumber*4;
        const name = allData.subarray(addr, addr + 4);
        return String.fromCharCode(name[0], name[1], name[2], name[3]);
    },
    getSetupName: function(setupNumber) {
        const addr = addrSetupNames + setupNumber*4;
        const name = allData.subarray(addr, addr + 4);
        return String.fromCharCode(name[0], name[1], name[2], name[3]);
    }
};


(function initialiseValues() {
    allData.fill(0);
    for (let setup=0; setup<16; setup++) {
        const name = `SE${(setup<9?'0':'')+(setup+1)}`;
        P.setSetupName(setup, name);
        for (let group=0; group<16; group++) {
            const name = `GR${(group<9?'0':'')+(group+1)}`;
            P.setGroupName(setup, group, name);
            for (let encoder=0; encoder<16; encoder++) {
                const name = `EC${(encoder<9?'0':'')+(encoder+1)}`;
                P.set(setup, group, encoder, P.name, name);
                P.set(setup, group, encoder, P.channel, group + 1);
                P.set(setup, group, encoder, P.scale, 1);
                P.set(setup, group, encoder, P.type, 2);
                P.set(setup, group, encoder, P.mode, 3);
                P.set(setup, group, encoder, P.upper, 127);
            }
        }
    }
    isDirty = false;
    // console.log(allData.length, new TextDecoder("utf-8").decode(allData));
})();


const REnameChars = new RegExp('[A-Za-z0-9.\\-/ ]');
const REnotNameChars = new RegExp('[^A-Za-z0-9.\\-/ ]');
const REnumberChars = new RegExp('[0-9]');

class InputHandler {

    constructor(selection) {
        this.selection = selection;
    }

    checkNameKey(e, element, what) {
        let allowed = true;
        if (e.key.length===1) {
            if (!REnameChars.test(e.key)) {
                allowed = false;
            }
        }
        if (!allowed) {
            e.preventDefault();
        }
        return allowed;
    }

    checkNumberKey(e, element, what) {
        let allowed = true;
        if (e.key.length===1) {
            if (!REnumberChars.test(e.key)) {
                allowed = false;
            }
        }
        if (!allowed) {
            e.preventDefault();
        }
        return allowed;
    }

    checkValue(element, what) {
        let value = element.value;
        switch (what) {
            case 'channel':
                if (value<1) value = 1;
                else if (value>16) value = 16;
                break;
            case 'number':
                if (DOM.parentsUpAttribute(element, 'data-type')==4 && value>31) {
                    value = 31;
                }
            case 'number_h':
            case 'lower':
            case 'upper':
                if (value<0) value = 0;
                else if (value>127) value = 127;
                break;
        }
        element.value = value;
    }

    distributeValue(element, what) {
        if (what === 'name-setup') {
            const setupNumber = element.getAttribute('data-number');
            P.setSetupName(setupNumber, element.value);
        } else if (what === 'name-group') {
            const numbers = element.getAttribute('data-number').split(',');
            P.setGroupName(numbers[0], numbers[1], element.value);
        } else {
            const encid = this.findReferencedEncoder(element);
            DOM.all(`.watchparams *[data-watch=${what}]`, el => {
                let eid = this.findReferencedEncoder(el);
                if (eid === encid) {
                    el.value = element.value;
                    if (typeof element.selectedIndex!=='undefined') {
                        el.selectedIndex = element.selectedIndex;
                    }
                }
            });
            let storeVal = (typeof element.selectedIndex!=='undefined')?element.selectedIndex:element.value;
            P.set(this.selection.setup, this.selection.group, encid, what, storeVal);
            if (what===P.type) {
                if (encid===this.selection.encoder) {
                    DOM.element('#oled').setAttribute('data-type', storeVal);
                }
                DOM.all('#ctrlcontainer .enc', (el=>{
                    const eid = this.findReferencedEncoder(el);
                    const type = P.get(this.selection.setup, this.selection.group, eid, P.type);
                    el.setAttribute('data-type', type);
                }));
            }
        }
    }

    findReferencedEncoder(element) {
        let encoderId = DOM.parentsUpAttribute(element, 'data-enc');
        if (encoderId) {
            return parseInt(encoderId);
        } else { 
            return this.selection.encoder;
        }
    }

}

document.addEventListener("DOMContentLoaded", function() {
    const sel = new Selection(selection => {
        console.log(`>> Selection ${selection.setup}, ${selection.group}, ${selection.encoder}`);
        // sync values
        DOM.removeClass('#ctrlcontainer .enc', 'selected');
        DOM.addClass(`#ctrlcontainer #enc${selection.encoder}`, 'selected');
        syncValues();
    });
    const inputhandler = new InputHandler(sel);
    const sysex = new Sysex('EC4');

    buildUI();

    function syncValues() {
        DOM.removeClass('#browser li', 'selected');
        DOM.addClass(`#browser > li:nth-child(${sel.setup+1})`, 'selected');
        DOM.addClass(`#browser > li:nth-child(${sel.setup+1}) li:nth-child(${sel.group+1})`, 'selected');

        DOM.all('.watchparams *[data-watch]', el=>{
            const what = el.getAttribute('data-watch');
            const encoderId = inputhandler.findReferencedEncoder(el);
            const value = P.get(sel.setup, sel.group, encoderId, what);
            if (typeof value === 'undefined') {
                return;
            }
            // console.log(`${sel.setup}, ${sel.group}, ${encoderId}: ${what} = ${value}`);
            if (typeof el.selectedIndex !== 'undefined') {
                el.selectedIndex = value;
            }
            else {
                if (typeof el.value !== 'undefined') {
                    el.value = value;
                }
            }
        });
        DOM.element('#oled').setAttribute('data-type', P.get(sel.setup, sel.group, sel.encoder, P.type));
        DOM.all('#ctrlcontainer .enc', (el=>{
            const eid = inputhandler.findReferencedEncoder(el);
            const type = P.get(sel.setup, sel.group, eid, P.type);
            el.setAttribute('data-type', type);
        }));
        for (let i=0; i<16; i++) {
            const setupAddr = addrSetupNames + i*4;
            const nameChars = allData.subarray(setupAddr, setupAddr + 4);
            const setupName = String.fromCharCode(nameChars[0], nameChars[1], nameChars[2], nameChars[3]).replace(REnotNameChars,' ');
            DOM.element(`#s${i}`).value = setupName;
            for (let j=0; j<16; j++) {
                const groupAddr = addrGroupNames + i*64 + j*4;
                const nameChars = allData.subarray(groupAddr, groupAddr + 4);
                const groupName = String.fromCharCode(nameChars[0], nameChars[1], nameChars[2], nameChars[3]).replace(REnotNameChars,' ');
                DOM.element(`#s${i}g${j}`).value = groupName;
            }
        }
    }

    syncValues();

    function selectEncoder(e) {
        let selectedId = -1;
        switch (e.type) {
            case 'click':
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                    return;
                }
                selectedId = inputhandler.findReferencedEncoder(e.target);
            break;
            case 'change':
                selectedId = e.target.selectedIndex;
            break;
        }
        console.log(`selectedId ${selectedId}`);
        if (selectedId>-1) {
            sel.encoder = selectedId;
            DOM.element('#oled *[data-watch=select-encoder]').selectedIndex = selectedId;
        }
    }

    function actionHandler(e) {
        const action = e.currentTarget.getAttribute('data-action');
        console.log(`Action ${action}`);
        if (action.indexOf('edit-') === 0) {
            const name = action.split('-')[1];
            DOM.element('#ctrlcontainer').setAttribute('data-mode', name);
            DOM.element('#oled').setAttribute('data-mode', name);
            if (P.labels[name]) {
                DOM.element('#toallenc span').innerText = P.labels[name];
                DOM.show('#toallenc');
            } else {
                DOM.hide('#toallenc');
            }
            const eled = DOM.element(`#oled *[data-watch=${name}]`);
            if (eled) {
                if (eled.tagName === 'INPUT') eled.select();
                eled.focus();
            }
        }
        switch (action) {
            case 'select-setup':
            case 'select-group':
                let number = e.currentTarget.getAttribute('data-number');
                if (action === 'select-setup') {
                    sel.setup = number;
                    sel.group = 0;
                } else {
                    sel.group = number;
                }
                break;
            case 'select-encoder':
                selectEncoder(e);
                break;
            case 'copy2all':
                const what = DOM.parentsUpAttribute(e.target, 'data-mode');
                const type = DOM.parentsUpAttribute(e.target, 'data-type');
                const value = P.get(sel.setup, sel.group, sel.encoder, what);
                const number_h = P.get(sel.setup, sel.group, sel.encoder, P.number_h);
                for (let i=0; i<16; i++) {
                    P.set(sel.setup, sel.group, i, what, value);
                    if (what===P.number && type==='8') {
                        P.set(sel.setup, sel.group, i, P.number_h, number_h);
                    }
                }
                syncValues();
                break;
        }
        e.stopPropagation();
    }

    DOM.all('*[data-action]', e=> {
        e.addEventListener('click', actionHandler);
    });

    function watchHandler(event) {
        const what = event.currentTarget.getAttribute('data-watch') || event.target.getAttribute('data-watch');
        let encoderId = null;
        encoderId = inputhandler.findReferencedEncoder(event.target) || sel.encoder;
        console.log(`Watch ${what} on ${event.target} ${encoderId}`);
        switch (what) {
            case P.name:
            case 'name-setup':
            case 'name-group':
                return inputhandler.checkNameKey(event, event.target, what);
            case 'select-encoder':
                selectEncoder(event);
                return;
            case 'number':
            case 'number_h':
            case 'lower':
            case 'upper':
            case 'channel':
                if (event.key==='ArrowUp' || event.key==='ArrowDown') {
                    const add = (event.key==='ArrowUp')?1:-1;
                    event.target.value = parseInt(event.target.value) + add;
                    inputhandler.checkValue(event.target, what);
                    inputhandler.distributeValue(event.target, what);
                    return;
                }
                break;
        }
        if (event.target.tagName==='INPUT') {
            return inputhandler.checkNumberKey(event, event.target, what);
        }
    }

    DOM.all('*[data-watch]', element => {
        const what = element.getAttribute('data-watch');
        switch (element.tagName) {
            case 'SELECT': 
                element.addEventListener('change', (ev)=>{watchHandler(ev); inputhandler.distributeValue(event.target, what)});
            break;
            case 'INPUT':
                element.addEventListener('keydown', watchHandler);
                element.addEventListener('keyup', ()=>{inputhandler.distributeValue(event.target, what);})
            break;
        }
        element.addEventListener('blur', ev => { 
            inputhandler.checkValue(element, what); 
            inputhandler.distributeValue(element, what);
        });
    });

    function generateSysexData() {
        const deviceparts = sysex.hilo(sysex.deviceId);
        let dataout = [0xf0, 0x00, 0x00, 0x00, 0x41, deviceparts[0], deviceparts[1], 0x42, 0x20, 0x13, 0x43, 0x20, 0x10, 0x44, 0x20, 0x12];
        const pages = allData.length / 64;
        for (let page=0; page<pages; page++) {
            const pos = page*64;
            const addr = pos + dataOffset;
            dataout.push(0x49, ...sysex.hilo(addr>>8));
            dataout.push(0x4a, ...sysex.hilo(addr & 0xff));
            let crc = 0;
            for (let i=0; i<64; i++) {
                dataout.push(0x4d, ...sysex.hilo(allData[pos+i]));
                crc += allData[pos+i];
            }
            crc = crc&0xffff;
            dataout.push(0x4b, ...sysex.hilo((crc&0xff00)>>8)); // CRC high
            dataout.push(0x4c, ...sysex.hilo((crc&0x00ff))); // CRC low
            dataout.push(...Sysex._padding);
        }
        dataout.push(0x4f); // download stop
        dataout.push(...deviceparts);
        dataout.push(0xf7);
        return new Uint8Array(dataout);
    }


    function interpretSysExData(data) {
        allData.fill(0);
        sysex.parseSysexData(data, chunk => {}, (addr, pagedata)=>{
            allData.set(pagedata, addr - dataOffset);
        });
        syncValues();
        isDirty = false;
    }

    function sysexHandler(data) {
        try {
            MBox.show(SEC4.title_data_received, SEC4.msg_apply, {
                confirmCallback: function() {
                    MBox.hide();
                    interpretSysExData(data);
                    MBox.show(SEC4.title_data_received, SEC4.msg_data_applied, {hideAfter:5000});
                }
            });
        }
        catch(e) {
            MBox.show(SEC4.title_data_received, STR.apply(SEC4.$msg_invalid_data ,e.message), {hideAfter:10000, type:'error'});
        }
    }

    const midi = new MIDI("Faderfox EC4", sysexHandler);

    DOM.on('#btntransfer', 'click', function() {
        if (midi.hasOutput()) {
            MBox.show(SEC4.title_send, SEC4.msg_send, {
                buttonLabel: "Send",
                confirmCallback: function() {
                    MBox.hide();
                    let data = generateSysexData();
                    midi.sendSysex(data, 25000);
                }
            });
        }
        else {
            MBox.show(STR.midictrl.title_error, STR.midictrl.nooutputs, {type:'error'});
        }
    });
    DOM.on('#btnreceive', 'click', function() {
        if (midi.hasInput()) {
            MBox.show(SEC4.title_receive, SEC4.msg_receive);
        }
        else {
            MBox.show(STR.midictrl.title_error, STR.midictrl.noinputs, {type:'error'});
        }
    });

    DOM.on('#btnfilesave', 'click', function() {
        MBox.show(SEC4.title_save, SEC4.msg_save+'<br/><br/><div class="field"><label>Filename:</label><input name="filename" type="text" size="12" value="" placeholder="filename" /><b>.syx</b></div>', 
        {
            buttonLabel: 'Save File',
            confirmCallback: function() {
                let filename = DOM.element('#mbox input[name=filename]').value;
                if (filename && filename!=="") {
                    download(generateSysexData(), filename+".syx", "application/octet-stream" ); 
                }
                MBox.hide();
            }
        });
        
    });

    DOM.on('#btnfileload', 'click', function() {
        MBox.show(SEC4.title_load, SEC4.msg_load+'<br/><br/><input type="file" name="file" />', {
            attachHandlers: function(boxelement) {
                DOM.attachInside(boxelement, 'input[type=file]', 'change', function(evt) {
                    sysex.readFile(evt.target, function(data) {
                        if (data) {
                            interpretSysExData(data);
                            MBox.hide();
                            MBox.show(SEC4.title_load, SEC4.msg_loaded, {hideAfter:5000});
                        }
                    });
                }); 
            }
        });
    });

    function copyToClipboard(what) {
        if (what==='group') {
            const addr = addrPresets + (sel.setup*16 + sel.group)*lengthGroup;
            clipboardDataGroup = new Uint8Array(lengthGroup);
            for (let i=0;i<lengthGroup;i++) {
                clipboardDataGroup[i] = allData[addr+i];
            }
            MBox.show(SEC4.title_copypaste, STR.apply(SEC4.$msg_copy_group, `${sel.group+1} (&quot;${P.getGroupName(sel.setup, sel.group)}&quot;)`), { hideAfter: 5000});
        } else { // whole setup
            const addr = addrPresets + (sel.setup*lengthSetup);
            clipboardDataSetup.setupData = new Uint8Array(lengthSetup);
            for (let i=0;i<lengthSetup;i++) {
                clipboardDataSetup.setupData[i] = allData[addr+i];
            }
            const addrGNames = addrGroupNames + sel.setup*64;
            clipboardDataSetup.groupNames = new Uint8Array(64);
            for (let i=0;i<64;i++) {
                clipboardDataSetup.groupNames[i] = allData[addrGNames+i];
            }
            MBox.show(SEC4.title_copypaste, STR.apply(SEC4.$msg_copy_setup, `${sel.setup+1} (&quot;${P.getSetupName(sel.setup)}&quot;)`), { hideAfter: 5000});
        }
    }
    function pasteFromClipboard(what) {
        if (what==='group') {
            if (!clipboardDataGroup) {
                MBox.show(SEC4.title_copypaste, SEC4.msg_clipboard_empty, { hideAfter: 5000});
            } else {
                MBox.show(SEC4.title_copypaste, STR.apply(SEC4.$msg_paste_group, `${sel.group+1} (&quot;${P.getGroupName(sel.setup, sel.group)}&quot;)`), { 
                    confirmCallback: function() {
                        const addr = addrPresets + (sel.setup*16 + sel.group)*lengthGroup;
                        for (var i=0;i<lengthGroup;i++) {
                            allData[addr+i] = clipboardDataGroup[i];
                        }
                        syncValues();
                        MBox.hide();
                        MBox.show(SEC4.title_copypaste, SEC4.msg_pasted, { hideAfter: 5000});
                    }
                });
            }
        } else {
            if (!clipboardDataSetup.setupData || !clipboardDataSetup.groupNames) {
                MBox.show(SEC4.title_copypaste, SEC4.msg_clipboard_empty, { hideAfter: 5000});
            } else {
                MBox.show(SEC4.title_copypaste, STR.apply(SEC4.$msg_paste_setup, `${sel.setup+1} (&quot;${P.getSetupName(sel.setup)}&quot;)`), { 
                    confirmCallback: function() {
                        const addr = addrPresets + (sel.setup*lengthSetup);
                        for (let i=0;i<lengthSetup;i++) {
                            allData[addr+i] = clipboardDataSetup.setupData[i];
                        }
                        const addrGNames = addrGroupNames + sel.setup*64;
                        for (let i=0;i<64;i++) {
                            allData[addrGNames+i] = clipboardDataSetup.groupNames[i];
                        }
                        syncValues();
                        MBox.hide();
                        MBox.show(SEC4.title_copypaste, SEC4.msg_pasted, { hideAfter: 5000});
                    }
                });
            }
        }
    }
    DOM.on('#btncopygroup', 'click', function() { copyToClipboard('group') });
    DOM.on('#btnpastegroup', 'click', function() { pasteFromClipboard('group') });
    DOM.on('#btncopysetup', 'click', function() { copyToClipboard('setup') });
    DOM.on('#btnpastesetup', 'click', function() { pasteFromClipboard('setup') });

    window.addEventListener('beforeunload', function (e) {
        if (isDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
      });

    sel.setAll(0, 0, 0);

});

function buildUI() {
    function createNameInput(id, type, number, value) {
        let element = document.createElement('input');
        element.setAttribute('id',id);
        element.setAttribute('type','text');
        element.setAttribute('data-watch', 'name-'+type);
        element.setAttribute('data-number', number);
        element.setAttribute('maxlength',4);
        element.setAttribute('value',value || '');
        return element;
    }
    let setupList = document.createElement('ul')
    setupList.setAttribute('id', 'browser');
    for (let setupNumber=0;setupNumber<16;setupNumber++) {
        let setupItem = document.createElement('li');
        setupItem.setAttribute('data-action', 'select-setup');
        setupItem.setAttribute('data-number', setupNumber);
        if (setupNumber===0) {
            setupItem.classList.add('selected');
        }
        let groupList = document.createElement('ul');
        groupList.className = 'group';
        for (let groupNumber=0;groupNumber<16;groupNumber++) {
            let groupItem = document.createElement('li');
            groupItem.setAttribute('data-action', 'select-group');
            groupItem.setAttribute('data-number', groupNumber);
            if (groupNumber===0) {
                groupItem.classList.add('selected');
            }
            groupItem.appendChild(createNameInput(`s${setupNumber}g${groupNumber}`, 'group', `${setupNumber},${groupNumber}`, 'GR'+(groupNumber<9?'0':'')+(groupNumber+1)));
            groupList.appendChild(groupItem);
        }
        setupItem.appendChild(createNameInput(`s${setupNumber}`, 'setup', setupNumber, 'SE'+(setupNumber<9?'0':'')+(setupNumber+1)));
        setupItem.appendChild(groupList);
        setupList.appendChild(setupItem);
    }
    DOM.element('#setupsandgroups').prepend(setupList);

    // build encoders
    for (let i=0; i<16; i++) {
        const twodig = (i<9?'0':'') + (i+1);
        let html = `
            <section>
                <div id="enc${i}" data-action="select-encoder" data-enc="${i}" class="enc">
                    <div class="knob"></div>
                    <div class="n"><input data-watch="name" id="enc_name${i}" type="text" maxlength="4" value="EC${twodig}" tabindex="${200+i}"/></div>
                    <div class="v">
                        <div class="number">
                            <div class="standard"><label>Number</label><input data-watch="number" maxlength="3" type="text" value="0" tabindex="${216+i}"/></div>
                            <div class="hi-lo"><label># Hi/Low</label>
                                <input data-watch="number" maxlength="3" type="text" value="0" tabindex="${216+i}" />
                                <input data-watch="number_h" maxlength="3" type="text" value="0" tabindex="${216+i}" />
                            </div>
                        </div>
                        <div class="channel"><label>Channel</label><input data-watch="channel" maxlength="2" type="text" value="0" tabindex="${216+i}" /></div>
                        <div class="lower"><label>Lower</label><input data-watch="lower" maxlength="3" type="text" value="0" tabindex="${216+i}" /></div>
                        <div class="upper"><label>Upper</label><input data-watch="upper" maxlength="3" type="text" value="0" tabindex="${216+i}" /></div>
                        <div class="scale"><label>Display</label>
                            <select data-watch="scale" tabindex="${216+i}">
                                <option>display off</option>
                                <option>0...127</option>
                                <option>0...100</option>
                                <option>0...1000</option>
                                <option>-63...+63</option>
                                <option>-50...+50</option>
                                <option>-500...+500</option>
                                <option>ON / OFF</option>
                            </select>
                        </div>
                        <div class="type"><label>Type</label>
                            <select data-watch="type" tabindex="${216+i}">
                                <option>CC relative 1</option>
                                <option>CC relative 2</option>
                                <option>CC absolute</option>
                                <option>Program change</option>
                                <option>CC 14bit absolute</option>
                                <option>Pitch bend</option>
                                <option>Aftertouch</option>
                                <option>Note</option>
                                <option>NRPM</option>
                            </select>
                        </div>
                        <div class="mode"><label>Mode</label>
                            <select data-watch="mode" tabindex="${216+i}">
                                <option>no acceleration</option>
                                <option>low acceleration</option>
                                <option>mid acceleration</option>
                                <option>max acceleration</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>`;
        DOM.addHTML('#ctrlcontainer', 'beforeend', html);
    }
}
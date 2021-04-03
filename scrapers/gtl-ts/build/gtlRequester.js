"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GTLRequester = void 0;
class GTLRequester {
    constructor(headers, viewState, prefix1, prefix2, postBody, page) {
        this.headers = headers;
        this.viewState = viewState;
        this.prefix1 = prefix1;
        this.prefix2 = prefix2;
        this.postBody = postBody;
        this.page = page;
        this.URL = "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn";
    }
    request(form_data) {
        return this.page.evaluate(async (headers, url, form_data) => {
            let formBody = [];
            for (var property in form_data) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = property.includes("phoneNumber")
                    ? form_data[property]
                    : encodeURIComponent(form_data[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            const formBodyStr = formBody.join("&");
            const response = await fetch(url, {
                headers,
                referrer: "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn",
                referrerPolicy: "strict-origin-when-cross-origin",
                body: formBodyStr,
                method: "POST",
                mode: "cors",
                credentials: "include",
            });
            const text = await response.text();
            return text;
        }, this.headers, this.URL, form_data);
    }
    async updateService() {
        /*
    Switch Service Request Body
    javax.faces.partial.ajax: true
    javax.faces.source: j_idt90:service
    javax.faces.partial.execute: j_idt90:service
    javax.faces.partial.render: @none
    javax.faces.behavior.event: valueChange
    javax.faces.partial.event: change
    j_idt90: j_idt90
    j_idt90:service: Collect
    j_idt90:facilityState: CA
    j_idt90:facility: 355
    j_idt90:subfacility:
    j_idt90:phoneNumber: (310) 333-3338
    j_idt90:hour: 3
    j_idt90:minute: 00
    j_idt90:amPm: AM
    j_idt90:callDuration: 1
    javax.faces.ViewState: -998892681247474967:7022445943653173121
*/
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:service`,
            "javax.faces.partial.execute": `${this.prefix1}:service`,
            "javax.faces.partial.render": "@none",
            "javax.faces.behavior.event": "valueChange",
            "javax.faces.partial.event": "change",
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this.postBody.service,
            [`${this.prefix1}:facilityState`]: this.postBody.facilityState,
            [`${this.prefix1}:facility`]: this.postBody.facility,
            [`${this.prefix1}:phoneNumber`]: this.postBody.phoneNumber,
            [`${this.prefix1}:hour`]: this.postBody.hour,
            [`${this.prefix1}:minute`]: this.postBody.minute,
            [`${this.prefix1}:amPm`]: this.postBody.amPm,
            [`${this.prefix1}:callDuration`]: this.postBody.callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        return await this.request(body);
    }
    async updateState() {
        /*
    Switch State Request Body
    javax.faces.partial.ajax: true
    javax.faces.source: j_idt90:facilityState
    javax.faces.partial.execute: j_idt90:facilityState
    javax.faces.partial.render: j_idt90
    javax.faces.behavior.event: valueChange
    javax.faces.partial.event: change
    j_idt90: j_idt90
    j_idt90:service: AdvancePay
    j_idt90:facilityState: AR
    j_idt90:facility: 596
    j_idt90:phoneNumber: (310) 333-3338
    j_idt90:hour: 3
    j_idt90:minute: 00
    j_idt90:amPm: AM
    j_idt90:callDuration: 1
    javax.faces.ViewState: -998892681247474967:7022445943653173121
*/
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:facilityState`,
            "javax.faces.partial.execute": `${this.prefix1}:facilityState`,
            "javax.faces.partial.render": this.prefix1,
            "javax.faces.behavior.event": "valueChange",
            "javax.faces.partial.event": "change",
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this.postBody.service,
            [`${this.prefix1}:facilityState`]: this.postBody.facilityState,
            [`${this.prefix1}:facility`]: this.postBody.facility,
            [`${this.prefix1}:phoneNumber`]: this.postBody.phoneNumber,
            [`${this.prefix1}:hour`]: this.postBody.hour,
            [`${this.prefix1}:minute`]: this.postBody.minute,
            [`${this.prefix1}:amPm`]: this.postBody.amPm,
            [`${this.prefix1}:callDuration`]: this.postBody.callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        return await this.request(body);
    }
    async updateFacility() {
        /*
        Switch Facility Request Body
        javax.faces.partial.ajax: true
        javax.faces.source: j_idt90:facility
        javax.faces.partial.execute: j_idt90:facility
        javax.faces.partial.render: j_idt90
        javax.faces.behavior.event: valueChange
        javax.faces.partial.event: change
        j_idt90: j_idt90
        j_idt90:service: AdvancePay
        j_idt90:facilityState: CA
        j_idt90:facility: 355
        j_idt90:phoneNumber: (310) 333-3338
        j_idt90:hour: 3
        j_idt90:minute: 00
        j_idt90:amPm: AM
        j_idt90:callDuration: 1
        javax.faces.ViewState: -998892681247474967:7022445943653173121
    */
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:facility`,
            "javax.faces.partial.execute": `${this.prefix1}:facility`,
            "javax.faces.partial.render": this.prefix1,
            "javax.faces.behavior.event": "valueChange",
            "javax.faces.partial.event": "change",
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this.postBody.service,
            [`${this.prefix1}:facilityState`]: this.postBody.facilityState,
            [`${this.prefix1}:facility`]: this.postBody.facility,
            [`${this.prefix1}:phoneNumber`]: this.postBody.phoneNumber,
            [`${this.prefix1}:hour`]: this.postBody.hour,
            [`${this.prefix1}:minute`]: this.postBody.minute,
            [`${this.prefix1}:amPm`]: this.postBody.amPm,
            [`${this.prefix1}:callDuration`]: this.postBody.callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        return await this.request(body);
    }
    async updateSubFacility() {
        /*
    Switch Sub Facility Request Body

    javax.faces.partial.ajax: true
    javax.faces.source: j_idt90:subfacility
    javax.faces.partial.execute: j_idt90:subfacility
    javax.faces.partial.render: j_idt90:subfacility j_idt90:subfacilityMessage
    javax.faces.behavior.event: valueChange
    javax.faces.partial.event: change
    j_idt90: j_idt90
    j_idt90:service: Collect
    j_idt90:facilityState: CA
    j_idt90:facility: 355
    j_idt90:subfacility: JV04
    j_idt90:phoneNumber: (310) 333-3338
    j_idt90:hour: 3
    j_idt90:minute: 00
    j_idt90:amPm: AM
    j_idt90:callDuration: 1
    javax.faces.ViewState: -998892681247474967:7022445943653173121
*/
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:subfacility`,
            "javax.faces.partial.execute": `${this.prefix1}:subfacility`,
            "javax.faces.partial.render": `${this.prefix1}:subfacility ${this.prefix1}:subfacilityMessage`,
            "javax.faces.behavior.event": "valueChange",
            "javax.faces.partial.event": "change",
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this.postBody.service,
            [`${this.prefix1}:facilityState`]: this.postBody.facilityState,
            [`${this.prefix1}:facility`]: this.postBody.facility,
            [`${this.prefix1}:subFacility`]: this.postBody.subFacility,
            [`${this.prefix1}:phoneNumber`]: this.postBody.phoneNumber,
            [`${this.prefix1}:hour`]: this.postBody.hour,
            [`${this.prefix1}:minute`]: this.postBody.minute,
            [`${this.prefix1}:amPm`]: this.postBody.amPm,
            [`${this.prefix1}:callDuration`]: this.postBody.callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        return await this.request(body);
    }
    async submit() {
        /*
    Submit Request Body

    javax.faces.partial.ajax: true
    javax.faces.source: j_idt90:j_idt176
    javax.faces.partial.execute: j_idt90
    javax.faces.partial.render: j_idt90
    j_idt90:j_idt176: j_idt90:j_idt176
    j_idt90: j_idt90
    j_idt90:service: Collect
    j_idt90:facilityState: CA
    j_idt90:facility: 355
    j_idt90:subfacility: JV04
    j_idt90:phoneNumber: (310) 333-3338
    j_idt90:hour: 3
    j_idt90:minute: 00
    j_idt90:amPm: AM
    j_idt90:callDuration: 1
    javax.faces.ViewState: -998892681247474967:7022445943653173121
*/
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:${this.prefix2}`,
            "javax.faces.partial.execute": `${this.prefix1}`,
            "javax.faces.partial.render": `${this.prefix1}`,
            [`${this.prefix1}:${this.prefix2}`]: `${this.prefix1}:${this.prefix2}`,
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this.postBody.service,
            [`${this.prefix1}:facilityState`]: this.postBody.facilityState,
            [`${this.prefix1}:facility`]: this.postBody.facility,
            [`${this.prefix1}:phoneNumber`]: this.postBody.phoneNumber,
            [`${this.prefix1}:hour`]: this.postBody.hour,
            [`${this.prefix1}:minute`]: this.postBody.minute,
            [`${this.prefix1}:amPm`]: this.postBody.amPm,
            [`${this.prefix1}:callDuration`]: this.postBody.callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        if (this.postBody.subFacility)
            body[`${this.prefix1}:subFacility`] = this.postBody.subFacility;
        return await this.request(body);
    }
    async updateAll() {
        await this.updateService();
        await this.updateState();
        await this.updateFacility();
        if (this.postBody.subFacility)
            await this.updateSubFacility();
        return await this.submit();
    }
}
exports.GTLRequester = GTLRequester;

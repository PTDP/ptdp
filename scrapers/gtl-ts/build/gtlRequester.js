"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GTLRequester = void 0;
const cheerio = __importStar(require("cheerio"));
const util_1 = require("./util");
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
        const result = await this.submit();
        return this.parser(result);
    }
    clean(currency) {
        var _a, _b;
        return parseFloat((_b = parseFloat((_a = currency === null || currency === void 0 ? void 0 : currency.trim()) === null || _a === void 0 ? void 0 : _a.replace("$", ""))) === null || _b === void 0 ? void 0 : _b.toFixed(2));
    }
    parser(html) {
        var _a, _b, _c, _d;
        const result = {
            service: this.postBody.service,
            facility: this.postBody.facility,
            subFacility: this.postBody.subFacility,
            phone: this.postBody.phoneNumber,
            source: this.URL,
            amountInitial: 0,
            durationInitial: 0,
            durationAdditional: 60,
            amountAdditional: null,
            liveAgentFee: null,
            automatedPaymentFee: null,
            paperBillStatementFee: null,
        };
        try {
            const $ = cheerio.load(html);
            let node = Array.from($("p strong")).find((node) => $(node).text().includes("The estimated cost of a phone call"));
            const amountAdditional = (_d = (_c = (_b = (_a = $(node)) === null || _a === void 0 ? void 0 : _a.text()) === null || _b === void 0 ? void 0 : _b.match(/\$.+/)) === null || _c === void 0 ? void 0 : _c.find(Boolean)) === null || _d === void 0 ? void 0 : _d.trim();
            if (amountAdditional) {
                const num = parseFloat(amountAdditional.replace("$", ""));
                const oneMinute = parseFloat((num / parseInt(this.postBody.callDuration)).toFixed(2));
                result.amountAdditional = oneMinute;
            }
            Array.from($("tr")).forEach((elt) => {
                const first_col_text = $($(elt).children()[0]).text();
                const second_col_text = $($(elt).children()[1]).text();
                if (first_col_text.includes("Live Agent Fee")) {
                    result.liveAgentFee = this.clean(second_col_text);
                }
                else if (first_col_text.includes("Automated Payment Fee")) {
                    result.automatedPaymentFee = this.clean(second_col_text);
                }
                else if (first_col_text.includes("Paper Bill/Statement Fee")) {
                    result.paperBillStatementFee = this.clean(second_col_text);
                }
            });
            return util_1.falseyToNull(result);
        }
        catch (err) {
            console.error(err);
            return util_1.falseyToNull(result);
        }
    }
}
exports.GTLRequester = GTLRequester;

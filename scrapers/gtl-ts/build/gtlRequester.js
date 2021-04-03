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
    constructor(metaData, postBody, page, scraperId) {
        this.page = page;
        this.scraperId = scraperId;
        this._hour = "12";
        this._minute = "00";
        this._amPm = "PM";
        this._callDuration = "15";
        this.URL = "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn";
        this.headers = metaData.headers;
        this.viewState = metaData.viewState;
        this.prefix1 = metaData.prefix1;
        this.prefix2 = metaData.prefix2;
        this._service = postBody.service;
        this._facilityState = postBody.facilityState;
        this._facility = postBody.facility;
        this._subFacility = postBody.subFacility;
        this._phoneNumber = this.phoneToGTLPhone(postBody.phoneNumber);
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
    phoneToGTLPhone(phone) {
        let n = "(";
        n += phone.slice(1, 4);
        n += ")";
        n += "+";
        n += phone.slice(4, 7);
        n += "-";
        n += phone.slice(7, 11);
        return n;
    }
    gtlPhoneToPhone(gtlPhone) {
        return ("1" +
            gtlPhone
                .replace("-", "")
                .replace("+", "")
                .replace("(", "")
                .replace(")", ""));
    }
    updateNumber(n) {
        this._phoneNumber = this.phoneToGTLPhone(n);
    }
    async updateService(s) {
        this._service = s;
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:service`,
            "javax.faces.partial.execute": `${this.prefix1}:service`,
            "javax.faces.partial.render": "@none",
            "javax.faces.behavior.event": "valueChange",
            "javax.faces.partial.event": "change",
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this._service,
            [`${this.prefix1}:facilityState`]: this._facilityState,
            [`${this.prefix1}:facility`]: this._facility,
            [`${this.prefix1}:subfacility`]: this._subFacility,
            [`${this.prefix1}:phoneNumber`]: this._phoneNumber,
            [`${this.prefix1}:hour`]: this._hour,
            [`${this.prefix1}:minute`]: this._minute,
            [`${this.prefix1}:amPm`]: this._amPm,
            [`${this.prefix1}:callDuration`]: this._callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        if (!this._subFacility)
            delete body[`${this.prefix1}:subfacility`];
        return await this.request(body);
    }
    async updateState() {
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:facilityState`,
            "javax.faces.partial.execute": `${this.prefix1}:facilityState`,
            "javax.faces.partial.render": this.prefix1,
            "javax.faces.behavior.event": "valueChange",
            "javax.faces.partial.event": "change",
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this._service,
            [`${this.prefix1}:facilityState`]: this._facilityState,
            [`${this.prefix1}:facility`]: this._facility,
            [`${this.prefix1}:subfacility`]: this._subFacility,
            [`${this.prefix1}:phoneNumber`]: this._phoneNumber,
            [`${this.prefix1}:hour`]: this._hour,
            [`${this.prefix1}:minute`]: this._minute,
            [`${this.prefix1}:amPm`]: this._amPm,
            [`${this.prefix1}:callDuration`]: this._callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        if (!this._subFacility)
            delete body[`${this.prefix1}:subfacility`];
        return await this.request(body);
    }
    async updateFacility(facility, facilityName) {
        this._facility = facility;
        this._facilityName = facilityName;
        this._subFacility = null;
        this._subFacilityName = null;
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:facility`,
            "javax.faces.partial.execute": `${this.prefix1}:facility`,
            "javax.faces.partial.render": this.prefix1,
            "javax.faces.behavior.event": "valueChange",
            "javax.faces.partial.event": "change",
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this._service,
            [`${this.prefix1}:facilityState`]: this._facilityState,
            [`${this.prefix1}:facility`]: this._facility,
            [`${this.prefix1}:phoneNumber`]: this._phoneNumber,
            [`${this.prefix1}:hour`]: this._hour,
            [`${this.prefix1}:minute`]: this._minute,
            [`${this.prefix1}:amPm`]: this._amPm,
            [`${this.prefix1}:callDuration`]: this._callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        return await this.request(body);
    }
    async updateSubFacility(sf, sf_name) {
        this._subFacility = sf;
        this._subFacilityName = sf_name;
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:subfacility`,
            "javax.faces.partial.execute": `${this.prefix1}:subfacility`,
            "javax.faces.partial.render": `${this.prefix1}:subfacility ${this.prefix1}:subfacilityMessage`,
            "javax.faces.behavior.event": "valueChange",
            "javax.faces.partial.event": "change",
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this._service,
            [`${this.prefix1}:facilityState`]: this._facilityState,
            [`${this.prefix1}:facility`]: this._facility,
            [`${this.prefix1}:subfacility`]: this._subFacility,
            [`${this.prefix1}:phoneNumber`]: this._phoneNumber,
            [`${this.prefix1}:hour`]: this._hour,
            [`${this.prefix1}:minute`]: this._minute,
            [`${this.prefix1}:amPm`]: this._amPm,
            [`${this.prefix1}:callDuration`]: this._callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        return await this.request(body);
    }
    async submit() {
        const body = {
            "avax.faces.partial.ajax": true,
            "javax.faces.source": `${this.prefix1}:${this.prefix2}`,
            "javax.faces.partial.execute": `${this.prefix1}`,
            "javax.faces.partial.render": `${this.prefix1}`,
            [`${this.prefix1}:${this.prefix2}`]: `${this.prefix1}:${this.prefix2}`,
            [this.prefix1]: this.prefix1,
            [`${this.prefix1}:service`]: this._service,
            [`${this.prefix1}:facilityState`]: this._facilityState,
            [`${this.prefix1}:facility`]: this._facility,
            [`${this.prefix1}:subfacility`]: this._subFacility,
            [`${this.prefix1}:phoneNumber`]: this._phoneNumber,
            [`${this.prefix1}:hour`]: this._hour,
            [`${this.prefix1}:minute`]: this._minute,
            [`${this.prefix1}:amPm`]: this._amPm,
            [`${this.prefix1}:callDuration`]: this._callDuration,
            "javax.faces.ViewState": this.viewState,
        };
        if (!this._subFacility)
            delete body[`${this.prefix1}:subFacility`];
        const result = await this.request(body);
        return this.parser(result);
    }
    async updateAll() {
        await this.updateService(this._service);
        await this.updateState();
        await this.updateFacility(this._facility, this._facilityName);
        if (this._subFacility)
            await this.updateSubFacility(this._subFacility, this._subFacilityName);
    }
    clean(currency) {
        var _a, _b;
        return parseFloat((_b = parseFloat((_a = currency === null || currency === void 0 ? void 0 : currency.trim()) === null || _a === void 0 ? void 0 : _a.replace("$", ""))) === null || _b === void 0 ? void 0 : _b.toFixed(2));
    }
    parser(html) {
        var _a, _b, _c, _d;
        const result = {
            service: this._service,
            facility: this._facilityName,
            subFacility: this._subFacilityName || null,
            phone: this.gtlPhoneToPhone(this._phoneNumber),
            scraper: this.scraperId,
            createdAt: Date.now(),
            state: this._facilityState,
            source: this.URL,
            amountInitial: null,
            durationInitial: null,
            durationAdditional: null,
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
                const oneMinute = parseFloat((num / parseInt(this._callDuration)).toFixed(2));
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

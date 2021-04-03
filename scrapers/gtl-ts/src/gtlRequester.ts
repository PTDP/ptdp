import * as cheerio from "cheerio";
import { falseyToNull, sleepInRange } from "./util";
import { GTLRate, GTLMetadata } from "./types";

export class GTLRequester {
    headers: any;
    viewState: string;
    prefix1: string;
    prefix2: string;

    _service: string;
    _facilityState: string;
    _facility: string;
    _subFacility: string;
    _phoneNumber: string;

    _hour: "12";
    _minute: "00";
    _amPm: "PM";
    _callDuration: "15";

    constructor(
        metaData: GTLMetadata,
        postBody,
        private page,
        private scraperId: string
    ) {
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

    URL =
        "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn";

    request(form_data) {
        return this.page.evaluate(
            async (headers, url, form_data) => {
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
                    referrer:
                        "https://www.connectnetwork.com/webapp/jsps/cn/ratesandfees/landing.cn",
                    referrerPolicy: "strict-origin-when-cross-origin",
                    body: formBodyStr,
                    method: "POST",
                    mode: "cors",
                    credentials: "include",
                });
                const text = await response.text();
                return text;
            },
            this.headers,
            this.URL,
            form_data
        );
    }

    phoneToGTLPhone(phone: string) {
        let n = "(";
        n += phone.slice(1, 4);
        n += ")";
        n += "+";
        n += phone.slice(4, 7);
        n += "-";
        n += phone.slice(7, 11);

        return n;
    }

    gtlPhoneToPhone(gtlPhone: string) {
        return (
            "1" +
            gtlPhone
                .replace("-", "")
                .replace("+", "")
                .replace("(", "")
                .replace(")", "")
        );
    }

    updateNumber(n: string) {
        this._phoneNumber = this.phoneToGTLPhone(n);
    }

    async updateService(s: string) {
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
            [`${this.prefix1}:phoneNumber`]: this._phoneNumber,
            [`${this.prefix1}:hour`]: this._hour,
            [`${this.prefix1}:minute`]: this._minute,
            [`${this.prefix1}:amPm`]: this._amPm,
            [`${this.prefix1}:callDuration`]: this._callDuration,
            "javax.faces.ViewState": this.viewState,
        };

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
            [`${this.prefix1}:phoneNumber`]: this._phoneNumber,
            [`${this.prefix1}:hour`]: this._hour,
            [`${this.prefix1}:minute`]: this._minute,
            [`${this.prefix1}:amPm`]: this._amPm,
            [`${this.prefix1}:callDuration`]: this._callDuration,
            "javax.faces.ViewState": this.viewState,
        };

        return await this.request(body);
    }

    async updateFacility(facility: string) {
        this._facility = facility;

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

    async updateSubFacility(sf) {
        this._subFacility = sf;

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
            [`${this.prefix1}:subFacility`]: this._subFacility,
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
            [`${this.prefix1}:phoneNumber`]: this._phoneNumber,
            [`${this.prefix1}:hour`]: this._hour,
            [`${this.prefix1}:minute`]: this._minute,
            [`${this.prefix1}:amPm`]: this._amPm,
            [`${this.prefix1}:callDuration`]: this._callDuration,
            "javax.faces.ViewState": this.viewState,
        };

        if (this._subFacility)
            body[`${this.prefix1}:subFacility`] = this._subFacility;

        const result = await this.request(body);
        return this.parser(result);
    }

    async updateAll() {
        await this.updateService(this._service);
        await this.updateState();
        await this.updateFacility(this._facility);
        if (this._subFacility) await this.updateSubFacility(this._subFacility);
    }

    clean(currency: string) {
        return parseFloat(
            parseFloat(currency?.trim()?.replace("$", ""))?.toFixed(2)
        );
    }

    parser(html): GTLRate {
        const result: GTLRate = {
            service: this._service,
            facility: this._facility,
            subFacility: this._subFacility,
            phone: this.gtlPhoneToPhone(this._phoneNumber),
            scraper: this.scraperId,
            createdAt: Date.now(),
            state: this._facilityState,

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

            let node = Array.from($("p strong")).find((node) =>
                $(node).text().includes("The estimated cost of a phone call")
            );

            const amountAdditional = $(node)
                ?.text()
                ?.match(/\$.+/)
                ?.find(Boolean)
                ?.trim();

            if (amountAdditional) {
                const num = parseFloat(amountAdditional.replace("$", ""));
                const oneMinute = parseFloat(
                    (num / parseInt(this._callDuration)).toFixed(2)
                );
                result.amountAdditional = oneMinute;
            }

            Array.from($("tr")).forEach((elt) => {
                const first_col_text = $($(elt).children()[0]).text();
                const second_col_text = $($(elt).children()[1]).text();
                if (first_col_text.includes("Live Agent Fee")) {
                    result.liveAgentFee = this.clean(second_col_text);
                } else if (first_col_text.includes("Automated Payment Fee")) {
                    result.automatedPaymentFee = this.clean(second_col_text);
                } else if (
                    first_col_text.includes("Paper Bill/Statement Fee")
                ) {
                    result.paperBillStatementFee = this.clean(second_col_text);
                }
            });

            return falseyToNull(result);
        } catch (err) {
            console.error(err);
            return falseyToNull(result);
        }
    }
}

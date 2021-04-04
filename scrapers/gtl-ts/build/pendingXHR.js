"use strict";
// class RequestInterceptor {
//   constructor(page, requestUrl) {
//     // https://icsonline.icsolutions.com/public-api/products
//   }
// }
Object.defineProperty(exports, "__esModule", { value: true });
class PendingXHR {
    constructor(page, oncomplete, requestUrl, onRequest, postDataFilter, postDataNotFilter) {
        this.oncomplete = oncomplete;
        this.promisees = [];
        this.page = page;
        this.resourceType = "xhr";
        this.pendingXhrs = new Set();
        this.finishedWithSuccessXhrs = new Set();
        this.finishedWithErrorsXhrs = new Set();
        this.requestListener = (request) => {
            try {
                if (request.resourceType() === this.resourceType &&
                    request.url() === requestUrl) {
                    if (onRequest)
                        this.pendingXhrs.add(request);
                    this.promisees.push(new Promise((resolve) => {
                        request.pendingXhrResolver = resolve;
                    }));
                }
            }
            catch (err) {
                console.log("CAUGHT ERR", err.toString());
            }
        };
        this.responseListener = async (response) => {
            const request = response.request();
            let correctPostData = false;
            if (request.postData()) {
                correctPostData =
                    request.postData().includes(postDataFilter) &&
                        !request.postData().includes(postDataNotFilter);
            }
            if (request.resourceType() === this.resourceType &&
                correctPostData) {
                await this.oncomplete(response);
                this.pendingXhrs.delete(request);
                this.finishedWithSuccessXhrs.add(request);
                if (request.pendingXhrResolver) {
                    request.pendingXhrResolver();
                }
                delete request.pendingXhrResolver;
            }
        };
        page.on("response", this.responseListener);
        page.on("request", this.requestListener);
    }
    removePageListeners() {
        this.page.removeListener("request", this.requestListener);
        this.page.removeListener("response", this.responseListener);
    }
    async waitForAllXhrFinished() {
        if (this.pendingXhrCount() === 0) {
            return;
        }
        await Promise.all(this.promisees);
    }
    async waitOnceForAllXhrFinished() {
        await this.waitForAllXhrFinished();
        this.removePageListeners();
    }
    pendingXhrCount() {
        return this.pendingXhrs.size;
    }
}
exports.default = PendingXHR;

// class RequestInterceptor {
//   constructor(page, requestUrl) {
//     // https://icsonline.icsolutions.com/public-api/products
//   }
// }

class PendingXHR {
  constructor(page, oncomplete, requestUrl, onRequest) {
    this.oncomplete = oncomplete;
    this.promisees = [];
    this.page = page;
    this.resourceType = "xhr";
    this.pendingXhrs = new Set();
    this.finishedWithSuccessXhrs = new Set();
    this.finishedWithErrorsXhrs = new Set();
    this.requestListener = (request) => {
      if (
        request.resourceType() === this.resourceType &&
        request.url() === requestUrl
      ) {
        if (onRequest)
          console.log("<><><><", request._request.HTTPRequest._headers);
        this.pendingXhrs.add(request);
        this.promisees.push(
          new Promise((resolve) => {
            request.pendingXhrResolver = resolve;
          })
        );
      }
    };
    this.responseListener = async (response) => {
      const request = response.request();
      if (request.resourceType() === this.resourceType) {
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

module.exports = PendingXHR;

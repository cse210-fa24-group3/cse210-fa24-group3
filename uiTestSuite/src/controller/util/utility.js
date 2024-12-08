// import Slack from "slack-node";
import $ from "jquery";
// import { WebClient } from "@slack/web-api";
// import request from "request";
// import { IncomingWebhook } from "@slack/webhook";
import { extractDataFromPerformanceTiming } from "./navigationTimingAPI.js";
import { createReadStream } from "node:fs";

// variables - UI test bot
const fileName = "./mochawesome-report/mochawesome.html";
// /Users/andrew/Documents/uitest/mochawesome-report/mochawesome.html

export default class Utility {
  constructor(page) {
    this.page = page;
  }

  async goto(url) {
    await Promise.all([this.page.goto(url)]);
  }

  async waitFor(time) {
    // deprecated function
    await this.page.waitFor(time);
  }

  async waitForTimeout(time) {
    this.page.waitForTimeout(time);
  }

  async waitForXPath(xpath, boolean) {
    this.page.waitForXPath(xpath, { visible: boolean, timeout: 0 });
  }

  async sleep(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
  }


  getTimezone() {
    const curr = new Date();
    const utc = curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;
    const PST_TIME_DIFF = -8 * 60 * 60 * 1000;
    const pstCurr = new Date(utc + PST_TIME_DIFF);
    return pstCurr.toISOString().slice(0, 19).replace('T', ' ');
  }
  

  // method for clicking element in uitest
  async click(locator) {
    this.waitForXPath(locator, true);

    let element = await this.page.$x(locator);
    element = element[0];

    await Promise.all([await element.click(), this.page.waitForTimeout(3000)]);
  }

  async getText(locator) {
    // this.waitForXPath(locator, true);

    try {
      let element = await this.page.$x(locator);
      element = element[0];

      return await element.evaluate((el) => el.textContent);
    } catch (e) {
      console.log("xpath error", e);
      return false;
    }
  }
}

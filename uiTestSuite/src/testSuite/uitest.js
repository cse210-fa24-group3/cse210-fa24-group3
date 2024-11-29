// Currently Broken

import puppeteer from "puppeteer";
import { assert, expect, util } from "chai";
import * as defaultSetting from "../model/data/constant.js";
// import * as testdata from "../model/data/data.js";
// import LoginPage from "../controller/pageObject/LoginPage.js";
import Utility from "../controller/util/utility.js";
import {} from "date-utils";
import xp from "../model/data/xpath.js";
import {} from "mochawesome-slack-reporter";

describe("UI Test", function () {
  var browser;
  var page;
  var temp_thread;
  var i = 0; // count total number
  // var j = 0; // count passed number
  var result;
  let msg;
  let current_time;

  let util = new Utility(page);
  // let LP = new LoginPage(page);
  let XP = new xp(page);

  this.timeout(60000); // for mocha timeout error

  before(async function () {
    // console.info("before")
    browser = await puppeteer.launch({
      headless: false,  // true: run test without window opening / false: window opens
      args: ["--no-sandbox", defaultSetting.WINODW_SIZE_UITEST],
      slowMo: 30, // 30ms delay
    });
    page = await browser.newPage();
    // page.setDefaultTimeout(150000);
    page.setDefaultNavigationTimeout(0);
    await page.setViewport({
      width: defaultSetting.WIDTH_UITEST,
      height: defaultSetting.HEIGHT_UITEST,
    });
    await Promise.all([page.goto(defaultSetting.TEST_URL), page.waitForNavigation()]);

    console.info(`* Starting UI Test`);
    // util = new Utility(page);
    current_time = util.getTimezone();

    // this.timeout(0);
    // done();
  });

  process.on("uncaughtException", function (err) {
    console.log("Caught exception: " + err);
    process.exit(1);
  });

  /* Save Failed cases for Final Report */
  afterEach(async function () {
    // console.log(`Test Result: ${this.currentTest.state}`);
    if (this.currentTest.state == "failed") {
      // To-do : Build list for saving Failed cases {failed_list}
    }
  });

  /* ------------------------------ Test #1 : Main Page ------------------------------ */
  // /* Test #1-1 : 'DevLog' Text */
  // it(`UT - ${++i} : 'DevLog' Text`, async function () {
  //   util = new Utility(page);
  //   console.info(`\n** UI Test #1 - DevLog Test -------------------------`);

  //   current_time = util.getTimezone();
  //   msg = `Test #1 : DevLog Main Page| ${current_time}`;

  //   const text_result = await util.getText(XP.main_devlog_xp);
  //   expect(text_result).to.equal("DevLog"); // Test for 'About' text

  //   await this.timeout(3000)
  // });

  // /* Test #1-2 : 'Home' Text */
  // it(`UT - ${++i} : 'Home' Text`, async function () {
  //   const text_result = await util.getText(XP.main_home_xp);
  //   expect(text_result).to.equal("Home"); // Test for 'Store' text

  //   await this.timeout(5000)
  // });

  // /* Test #1-3 : 'About' Text */
  // it(`UT - ${++i} : 'About' Text`, async function () {
  //   const text_result = await util.getText(XP.main_about_xp);
  //   expect(text_result).to.equal("About"); // Test for 'Store' text

  //   await this.timeout(3000)
  // });

  //   /* Test #2-1 : About Tab */
  // it(`UT - ${++i} : About Page`, async function () {
  //   console.info("*** Navigating to 'About' page");
  //   await util.click(XP.google_about_xp);
  //   console.info(`\n*** Test #2-1 : About page - 'Learn more' test`);
  //   const text_result = await util.getText(XP.google_learnmore_xp);
  //   expect(text_result).to.equal("\n          Learn more\n        "); // Test for 'New Folder' text

  //   await this.timeout(3000)


    // await this.timeout(5000);
    // await LP.setId(DP.LNB_newFolder_palceholder_xp, "Created New Folder");
    // await util.click(XP.LNB_newFolder_palceholder_xpcc); 
    // await page.type("test comment");
    // await page.keyboard.press("Enter");
    // await util.click(DP.LNB_newFolder_svg_xp);
    // await util.click(DP.LNB_newFolder_rename_xp);


  after(async function () {
    console.info(`\n* UI Test Completed `);
    let util = new Utility(page);
    current_time = util.getTimezone();

    // TODO: Save mochawesome report 

    await page.waitForTimeout(2000);
    await page.close();
    await browser.close();

    // done();
  });
});

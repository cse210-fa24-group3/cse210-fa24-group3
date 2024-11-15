import { expect } from "chai";
export default class xpath {
  constructor(page) {
    this.page = page;
  }

  /* DevLog */
  main_devlog_xp = "//*[text()='DevLog']"
  main_home_xp = "//*[text()='Home']"
  main_about_xp = "//*[text()='About']"

  /* google.com test */
  // google_about_xp = "//*[text()='About']"
  // google_store_xp = "//*[text()='Store']"
  // google_gmail_xp = "//*[text()='Gmail']"
  // google_images_xp = "//*[text()='Images']"
  // google_signin_xp = "//*[text()='Sign in']"
  // google_learnmore_xp = "//*[@id='page-content']/section[2]/div/div[4]/div[3]/a"

}

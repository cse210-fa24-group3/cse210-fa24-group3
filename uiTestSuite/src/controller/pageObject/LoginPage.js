export default class LoginPage {
  constructor(page) {
    this.page = page;
  }

  signin_xp = "//*[text()='Sign in']";
  id_xp = "//input[@placeholder='Email']";
  pw_xp = "//input[@placeholder='Password']";
  login_xp = "//button[text()='Log in']";

  async setId(locator, id) {
    let xp = await this.page.$x(locator);
    xp = xp[0];
    await xp.type(id);
  }

  async setPassword(locator, pw) {
    let xp = await this.page.$x(locator);
    xp = xp[0];
    await xp.type(pw);
  }

  async clickLogin(locator) {
    let login = await this.page.$x(locator);
    login = login[0];

    await Promise.all([
      await login.click(),
      await this.page.waitForTimeout(5000), // wait for 5000ms
      // await sleep(5000)
    ]);
  }
}

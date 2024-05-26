export class Scraper {
  private _dom: Document | undefined = undefined;

  /**
   * Initializes a new instance of the Scraper class.
   *
   * @param {Document} dom - The document to be scraped.
   */
  constructor(dom: Document) {
    this._dom = dom;
  }

  /**
   * Evaluates the given XPath expression against the current document and
   * returns the result as an XPathResult of type ORDERED_NODE_SNAPSHOT_TYPE.
   *
   * @param {string} xpath - The XPath expression to evaluate.
   * @return {XPathResult | null} - The result of the evaluation as an XPathResult of type ORDERED_NODE_SNAPSHOT_TYPE, or null if the current document is undefined.
   */
  private _evaluate(xpath: string): XPathResult | null {
    if (this._dom === undefined) return null;
    return document.evaluate(
      xpath,
      this._dom,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    );
  }

  /**
   * Normalizes the given URL by removing the path segment "/scraper/" from
   * the beginning.
   *
   * @param {string} url - The URL to be normalized.
   * @return {string} The normalized URL.
   */
  private _normalize(url: string): string {
    return url.replace(/^.+\/scraper\//i, "");
  }

  /**
   * Retrieves the alert element from the DOM.
   *
   * @return {string} The class name of the alert element, or null if the DOM is undefined or the alert element is not found.
   */
  get alert(): string {
    if (this._dom === undefined) return "";
    try {
      const sectionCursor =
        this._dom.querySelector(".al-news-ticker-bar") === null ? 3 : 4;
      // XPath: /html/body/section[3]/div/a/div
      const query = this._evaluate(`//section[${sectionCursor}]/div/a/div`);
      if (query?.snapshotLength == 0) return "";
      return (
        (query?.snapshotItem(0) as HTMLElement).className.split(
          "al-msgbar-"
        )[1] ?? null
      );
    } catch (err) {
      return "";
    }
  }
  /**
   * Retrieves the risk value from the DOM.
   *
   * @return {string} The risk value extracted from the DOM, or null if the DOM is undefined or the risk value is not found.
   */
  get risk(): string {
    if (this._dom === undefined) return "";
    try {
      const sectionCursor =
        this._dom.querySelector(".al-news-ticker-bar") === null ? 3 : 4;
      // XPath: /html/body/section[3]/div/a/div/h1
      const query = this._evaluate(`//section[${sectionCursor}]/div/a/div/h1`);
      if (query?.snapshotLength == 0) return "";
      return (
        (query?.snapshotItem(0) as HTMLElement).innerText.toLocaleLowerCase() ??
        null
      );
    } catch (err) {
      return "";
    }
  }
  /**
   * Retrieves the info value from the DOM.
   *
   * @return {string} The info value extracted from the DOM, or an empty string if the DOM is undefined or the info value is not found.
   */
  get info(): string {
    if (this._dom === undefined) return "";
    try {
      const sectionCursor =
        this._dom.querySelector(".al-news-ticker-bar") === null ? 3 : 4;
      // XPath: /html/body/section[3]/div/a/div/h2[2]
      const query = this._evaluate(
        `//section[${sectionCursor}]/div/a/div/h2[2]`
      );
      if (query?.snapshotLength == 0) return "";
      return (
        (query?.snapshotItem(0) as HTMLElement).innerText.toLocaleLowerCase() ??
        null
      );
    } catch (err) {
      return "";
    }
  }
  /**
   * Retrieves the date value from the DOM.
   *
   * @return {number} The date value extracted from the DOM, or the current timestamp if the DOM is undefined or the date value is not found.
   */
  get date(): number {
    if (this._dom === undefined) return Date.now();
    try {
      const sectionCursor =
        this._dom.querySelector(".al-news-ticker-bar") === null ? 3 : 4;
      // XPath: /html/body/section[3]/div/a/div/h2[1]
      const query = this._evaluate(
        `//section[${sectionCursor}]/div/a/div/h2[1]`
      );
      if (query?.snapshotLength == 0) return Date.now();
      const re =
        /.*(?<day>\d{2}).(?<month>\d{2}).(?<year>\d{4}).*(?<hours>\d{2}):(?<minutes>\d{2})/;
      const dateParts = re.exec(
        query?.snapshotItem(0)?.textContent ?? ""
      )?.groups;
      if (!dateParts) return Date.now();
      const { year, month, day, hours, minutes } = dateParts;
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      ).getTime();
    } catch (err) {
      return Date.now();
    }
  }
  /**
   * Retrieves the links from the DOM.
   *
   * @return {{ alert: string; forecast: string; map: string }} An object containing the links for the alert, forecast, and map.
   *                  If the DOM is undefined, an empty object is returned.
   *                  If any of the links are not found, an empty string is returned for that link.
   */
  get links(): { alert: string; forecast: string; map: string } {
    if (this._dom === undefined) return { alert: "", forecast: "", map: "" };
    try {
      const offsetCursor =
        this._dom.querySelector(".al-news-ticker-bar") === null ? 0 : 1;
      const links = { alert: "", forecast: "", map: "" };

      // XPath: /html/body/section[5]/div/div/div/div[2]/div/div[6]/div/a
      const alertBulletin = this._evaluate(
        `//section[${5 + offsetCursor}]/div/div/div/div[2]/div/div[6]/div/a`
      );
      links.alert =
        alertBulletin?.snapshotLength == 0 ?
          ""
        : this._normalize(
            (alertBulletin?.snapshotItem(0) as HTMLAnchorElement).href
          );

      // XPath: /html/body/section[5]/div/div/div/div[3]/div/div[4]/div/a
      const forecastBulletin = this._evaluate(
        `//section[${5 + offsetCursor}]/div/div/div/div[3]/div/div[4]/div/a`
      );
      links.forecast =
        forecastBulletin?.snapshotLength == 0 ?
          ""
        : this._normalize(
            (forecastBulletin?.snapshotItem(0) as HTMLAnchorElement).href
          );

      // XPath: /html/body/section[4]/div/div[1]/div/div[2]/div/img
      const alertMap = this._evaluate(
        `//section[${4 + offsetCursor}]/div/div[1]/div/div[2]/div/img`
      );
      links.map =
        alertMap?.snapshotLength == 0 ?
          ""
        : this._normalize((alertMap?.snapshotItem(0) as HTMLImageElement).src);

      return links;
    } catch (err) {
      return { alert: "", forecast: "", map: "" };
    }
  }
}

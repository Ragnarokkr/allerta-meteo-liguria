import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { until } from "lit/directives/until.js";

import "../../libs/ui/WallOfFame.ts";

import { hostCSS } from "./stylings.ts";

@customElement("credits-page")
export class CreditsPage extends LitElement {
  static override styles = hostCSS;

  @state()
  private _pageContent = fetch(
    `pages/${chrome.i18n.getUILanguage().substring(0, 2)}/credits.html`
  )
    .then((res) => res.text())
    .then((html) => unsafeHTML(html));

  override render() {
    return html`${until(
      this._pageContent,
      html`<span>${chrome.i18n.getMessage("loading")}</span>`
    )}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "credits-page": CreditsPage;
  }
}

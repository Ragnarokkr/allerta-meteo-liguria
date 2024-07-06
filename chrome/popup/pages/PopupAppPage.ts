import { LitElement, css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import type { Settings } from "../../libs/types/settings.ts";
import type { Status } from "../../libs/types/status.ts";

import "../../libs/ui/ActionsBar.ts";
import "../../libs/ui/ActionButton.ts";
import "../../libs/ui/AlertBox.ts";
import { styleMap } from "lit/directives/style-map.js";

@customElement("popup-app-page")
export class PopupAppPage extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: calc(480px + var(--padding-md) * 2);
      margin: 0;
      padding: 0;

      img {
        padding: var(--padding-md);
        background-color: var(--color-white);
      }

      div {
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: var(--padding-md);
        flex-wrap: wrap;
        padding: var(--padding-sm);
        font-size: var(--font-size-sm);
        text-transform: uppercase;
        text-wrap: nowrap;
      }
    }
  `;

  @state()
  private _settings: Partial<Settings> = {};

  @state()
  private _status: Partial<Status> = {};

  private _splitActionText(text: string) {
    const lines = text.split(" - ");
    return lines.map((line) => html`<span>${line}</span>`);
  }

  override async firstUpdated() {
    this._settings = (await chrome.storage.local.get("settings"))
      .settings as Settings;
    this._status = (await chrome.storage.local.get("status")).status as Status;
  }

  private _calculateSeverityStyles(severity: string) {
    switch (severity) {
      case "green":
        return {
          color: "var(--color-black)",
          backgroundColor: "var(--color-green)",
        };
      case "yellow":
        return {
          color: "var(--color-black)",
          backgroundColor: "var(--color-yellow)",
        };

      case "orange":
        return {
          color: "var(--color-black)",
          backgroundColor: "var(--color-orange)",
        };

      case "red":
        return {
          color: "var(--color-white)",
          backgroundColor: "var(--color-red)",
        };

      default:
        return {
          color: "var(--color-black)",
          backgroundColor: "var(--color-neutral-7)",
        };
    }
  }

  override render() {
    const severityStyles = this._calculateSeverityStyles(
      this._status.lastUpdate?.alert ?? ""
    );
    return html`
      <ui-actions-bar>
        <ui-action-button
          link="${this._settings.alertWebPage!}"
          i18n="civilProtection"
          icon="open_in_new"
        ></ui-action-button>
        <ui-action-button
          link="${this._settings.arpalWebPage!}"
          i18n="arpal"
          icon="open_in_new"
        ></ui-action-button>
      </ui-actions-bar>

      ${when(
        this._status.actionText,
        () =>
          html`<div style=${styleMap(severityStyles)}>
            ${this._splitActionText(this._status.actionText!)}
          </div>`,
        () => nothing
      )}
      ${when(
        this._status.lastUpdate?.links.map,
        () => html`<img src="${this._status.lastUpdate!.links.map}" />`,
        () => nothing
      )}
      ${when(
        this._status.lastUpdate?.info,
        () =>
          html`<div style=${styleMap(severityStyles)}>
            ${this._status.lastUpdate!.info}
          </div>`,
        () => nothing
      )}

      <ui-actions-bar>
        ${when(
          this._status.lastUpdate?.links.alert,
          () =>
            html`<ui-action-button
              link="${this._status.lastUpdate!.links.alert}"
              i18n="alertBulletin"
              icon="open_in_new"
            ></ui-action-button>`,
          () => nothing
        )}
        ${when(
          this._status.lastUpdate?.links.forecast,
          () =>
            html`<ui-action-button
              link="${this._status.lastUpdate!.links.forecast}"
              i18n="forecastBulletin"
              icon="open_in_new"
            ></ui-action-button>`,
          () => nothing
        )}
      </ui-actions-bar>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "popup-app-page": PopupAppPage;
  }
}

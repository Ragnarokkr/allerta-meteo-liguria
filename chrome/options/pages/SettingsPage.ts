import { html, css, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { guard } from "lit/directives/guard.js";
import { when } from "lit/directives/when.js";

import "../../libs/ui/AlertBox.ts";
import { hostCSS } from "./stylings.ts";

@customElement("settings-page")
export class SettingsPage extends LitElement {
  static override styles = [
    hostCSS,
    css`
      ::host {
        display: flex;
        flex-direction: column;
      }

      form {
        flex: 1;
        display: grid;
        grid-template-columns: max-content auto;
        align-items: baseline;
        column-gap: var(--padding-lg);
        row-gap: var(--padding-lg);
        padding: var(--padding-lg);
        border-radius: var(--border-radius-md);
        background-color: var(--color-card-background);

        label {
          font-weight: 700;
        }

        div {
          display: flex;
          flex-direction: column;
          gap: var(--padding-sm);

          & > input {
            font-family: "Overpass", sans-serif;
          }

          & > div {
            flex-direction: row;
            padding: var(--padding-sm) var(--padding-md);
            border-radius: var(--border-radius-md);
            background-color: var(--color-surface-input-normal);

            &:active {
              background-color: var(--color-surface-input-active);
            }

            & .interval-counter {
              font-size: var(--font-size-heading-6);
              font-family: "Overpass Mono", monospace;
            }
          }
        }

        div + span,
        input + span {
          align-self: flex-end;
          font-size: 0.95rem;
        }

        input[type="url"] {
          font-size: 1.4rem;
          padding: var(--padding-sm) var(--padding-md);
          outline: var(--border-width-sm) solid transparent;
          border-color: transparent;
          border-radius: var(--border-radius-md);
          background-color: var(--color-surface-input-normal);
          transition:
            outline 150ms linear,
            background-color 150ms linear;

          &:hover {
            outline: var(--border-width-md) solid var(--color-accent);
          }

          &:active,
          &:focus {
            outline: var(--border-width-md) solid var(--color-accent);
            background-color: var(--color-surface-input-active);
          }
        }

        input[type="range"] {
          flex: 1;
        }
      }

      .status {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-block: var(--padding-lg);
      }
    `,
  ];

  @state()
  private _civilProtection = "";
  @state()
  private _arpal = "";
  @state()
  private _interval = 0;
  @state()
  private _isSaving = false;
  @state()
  private _savingError = false;

  private async _setupFields() {
    const { settings } = await chrome.storage.local.get("settings");
    this._civilProtection = settings.alertWebPage;
    this._arpal = settings.arpalWebPage;
    this._interval = settings.updateInterval;
  }

  override async firstUpdated() {
    await this._setupFields();
  }

  private _onIntervalInput(event: Event) {
    this._interval = (event.target as HTMLInputElement).valueAsNumber;
  }

  private async _onChangeOrSubmit(event: Event) {
    event.preventDefault();
    try {
      this._isSaving = true;
      const formData = new FormData(event.currentTarget as HTMLFormElement);
      this._civilProtection = formData.get("civilProtection") as string;
      this._arpal = formData.get("arpal") as string;
      this._interval = Number(formData.get("interval"));
      const { settings } = await chrome.storage.local.get("settings");
      settings.alertWebPage = this._civilProtection;
      settings.arpalWebPage = this._arpal;
      settings.updateInterval = this._interval;
      await chrome.storage.local.set({ settings });
      setTimeout(() => {
        this._isSaving = false;
      }, 4000);
    } catch (error) {
      this._savingError = true;
      setTimeout(() => {
        this._savingError = false;
      }, 5000);
    }
  }

  override render() {
    return html`
      <form
        @change=${this._onChangeOrSubmit}
        @submit=${this._onChangeOrSubmit}
        id="settings-form"
      >
        <label for="civilProtection"
          >${chrome.i18n.getMessage("urlAlertLabel")}</label
        >
        <div>
          <input
            type="url"
            id="civilProtection"
            name="civilProtection"
            value=${live(this._civilProtection)}
          />
          <span>${chrome.i18n.getMessage("urlAlertHelp")}</span>
        </div>

        <label for="arpal">${chrome.i18n.getMessage("urlArpalLabel")}</label>
        <div>
          <input
            type="url"
            id="arpal"
            name="arpal"
            value=${live(this._arpal)}
          />
          <span>${chrome.i18n.getMessage("urlArpalHelp")}</span>
        </div>

        <label for="interval"
          >${chrome.i18n.getMessage("updateIntervalLabel")}</label
        >
        <div>
          <div>
            <span class="interval-counter"
              >${guard([this._interval], () => this._interval)} min</span
            >
            <input
              type="range"
              id="interval"
              name="interval"
              min="10"
              max="60"
              value=${live(this._interval)}
              list="markers"
              @input=${this._onIntervalInput}
            />

            <datalist id="markers">
              ${Array.from(
                { length: 6 },
                (_, i) => html`<option value=${i * 10} />`
              )}
            </datalist>
          </div>
          <span
            >${chrome.i18n.getMessage("updateIntervalHelp", ["10", "60"])}</span
          >
        </div>
      </form>

      ${when(
        this._isSaving,
        () =>
          html`<div class="status">
            <ui-alert-box
              >${chrome.i18n.getMessage("savingChanges")}</ui-alert-box
            >
          </div>`,
        () => nothing
      )}
      ${when(
        this._savingError,
        () =>
          html`<div class="status">
            <ui-alert-box severity="error"
              >${chrome.i18n.getMessage("savingError")}</ui-alert-box
            >
          </div>`,
        () => nothing
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-page": SettingsPage;
  }
}

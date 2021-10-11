import { css, html, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Theme } from '@digita-ai/dgt-theme';
import { SolidSDKService } from '../lib/services/solid-sdk.service'
import { AuthenticateComponent } from '../lib/components/authentication/authenticate.component';

export class DemoAuthenticateComponent extends RxLitElement {
  private solidService = new SolidSDKService('UI Transfer');

  onAuthenticated = (event: CustomEvent): void => {  };
  onCreateWebId = (event: CustomEvent): void => { alert('This is a demo') };


  constructor() {
    super();
    customElements.define('auth-flow', AuthenticateComponent);

  }
  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <auth-flow
      .solidService="${this.solidService}"
      @authenticated="${this.onAuthenticated}"
      @create-webid="${this.onCreateWebId}"
    >
      <h1 slot="beforeIssuers">Select an identity provider to log in</h1>
      <h1 slot="beforeWebId">Enter your WebID</h1>
    </auth-flow>
  `;

  }

  /**
   * The styles associated with the component.
   */
  static get styles() {

    return [
      unsafeCSS(Theme),
      css`
        auth-flow {
          --webid-input-padding: var(--gap-small);
        }
        h1[slot] {
          margin: var(--gap-large) var(--gap-normal);
          font-size: var(--font-size-header-normal);
          font-style: normal;
          font-weight: bold;
          text-align: center;
        }
      `,
    ];

  }

}

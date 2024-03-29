import { css, html, unsafeCSS } from 'lit-element';
import { RxLitElement } from 'rx-lit';
import { Login, Theme } from '@useid/dgt-theme';
import { SolidSDKService } from '@useid/inrupt-solid-service';
import { AuthenticateComponent } from '../lib/components/authentication/authenticate.component';
import { hydrate } from '../lib/util/hydrate';
import { WebIdValidator } from '../lib/components/authentication/authenticate.machine';
import { Translator } from '../lib/services/i18n/translator';

export class DemoAuthenticateComponent extends RxLitElement {

  private solidService = new SolidSDKService('DemoAuthenticateComponent');
  private trustedIssuers = [ 'https://inrupt.net/' ];
  private translations = {
    'common.webid-validation.invalid-uri': 'The URL of the entered WebID is invalid',
    'common.webid-validation.no-issuer': 'The WebID does not contain valid OIDC issuer',
  }
  private translator: Translator = {
    translate: (key: string) => this.translations[key],
  } as any

  // example validator
  private webIdValidator: WebIdValidator = async (webId: string) => {
    let results: string[] = [];
    try {
      new URL(webId);
    } catch {
      results.push('common.webid-validation.invalid-uri');
    }
    return results;
  }

  onAuthenticated = (): void => { alert('Demo event: authenticated') };
  onNoTrust = (): void => { alert('Demo event: no trusted issuers') };
  onCreateWebId = (): void => { alert('Demo event: create webid') };

  constructor() {
    super();
    // the most basic authenticate compnonent
    // customElements.define('auth-flow', hydrate(AuthenticateComponent)(this.solidService));

    // an authenticate component with trusted issuers and validator
    // customElements.define('auth-flow', hydrate(AuthenticateComponent)(this.solidService, this.trustedIssuers, this.webIdValidator));

    // an authenticate component with only validator
    customElements.define('auth-flow', hydrate(AuthenticateComponent)(this.solidService, undefined, this.webIdValidator));

  }
  /**
   * Renders the component as HTML.
   *
   * @returns The rendered HTML of the component.
   */
  render() {

    return html`
    <auth-flow
      @authenticated="${this.onAuthenticated}"
      @no-trust="${this.onNoTrust}"
      @create-webid="${this.onCreateWebId}"
      .translator="${this.translator}"
      .textButton="${Login}"
    >
      <h1 slot="beforeIssuers">Select an identity provider to log in</h1>
      <h1 slot="beforeWebId">Enter your WebID (horizontal view)</h1>
    </auth-flow>

    <auth-flow
      hideIssuers hideCreateNewWebId
      layout="vertical"
      @authenticated="${this.onAuthenticated}"
      @no-trust="${this.onNoTrust}"
      @create-webid="${this.onCreateWebId}"
      .translator="${this.translator}"
      textButton="Log in to your account"
    >
      <h1 slot="beforeIssuers">Select an identity provider to log in</h1>
      <h1 slot="beforeWebId">Enter your WebID (vertical view)</h1>
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

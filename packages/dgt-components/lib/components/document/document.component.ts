import { NamedNode, Store } from 'n3';
import { ComponentDataTypes } from '@digita-ai/semcom-core';
import { css, html, property } from 'lit-element';
import { ComponentResponseEvent } from '@digita-ai/semcom-sdk';
import { BaseComponent } from '../base/base.component';

export class DocumentComponent extends BaseComponent {

  @property() url?: string;
  @property() fileName?: string;

  handleResponse<D extends keyof ComponentDataTypes>(event: ComponentResponseEvent<D>): void {

    if (!event || !event.detail || !event.detail.data) {

      throw new Error('Argument event || !event.detail || !event.detail.data should be set.');

    }

    if (event.detail.type !== 'quads') {

      throw new Error('Unexpected response type.');

    }

    const n = 'http://www.w3.org/2006/vcard/ns#';

    const store = new Store(event.detail.data);

    this.fileName = store.getQuads(null, new NamedNode(`${n}fileName`), null, null)[0]?.object.value;
    this.url = store.getQuads(null, new NamedNode(`${n}url`), null, null)[0]?.object.value;

  }

  static get styles() {

    return [
      css`
        :host {
          font-family: 'Roboto', sans-serif;
          font-weight: 300;
        }
        .container {
          width: 100%;
          text-align: center;
          padding: 40px 0;
        }
      `,
    ];

  }

  render() {

    return html`
    <div class="container">
          <div class="document">
          <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M44.4505 8.7287L36.3425 0.620715C36.2621 0.540238 36.1615 0.5 36.0609 0.5H5.90238C5.68107 0.5 5.5 0.681072 5.5 0.902381V49.0976C5.5 49.3189 5.68107 49.5 5.90238 49.5H44.1689C44.3902 49.5 44.5712 49.3189 44.5712 49.0976V9.01037C44.5712 8.90977 44.531 8.80918 44.4505 8.7287ZM43.7665 9.30209H36.4633V1.87816L43.7665 9.18138V9.30209V9.30209ZM6.30476 48.6952V1.30476H35.7893C35.7088 1.37518 35.6686 1.47577 35.6686 1.59649V9.70448C35.6686 9.92579 35.8496 10.1069 36.0709 10.1069H43.7765V48.6952H6.30476Z" fill="#001028" stroke="#001028" stroke-width="2"/>
            <path d="M39.9941 30.9703H10.067C9.84571 30.9703 9.66464 31.1514 9.66464 31.3727C9.66464 31.594 9.84571 31.7751 10.067 31.7751H39.9941C40.2155 31.7751 40.3965 31.594 40.3965 31.3727C40.3965 31.1514 40.2155 30.9703 39.9941 30.9703Z" fill="#001028" stroke="#001028" stroke-width="2"/>
            <path d="M39.9941 39.4505H10.067C9.84571 39.4505 9.66464 39.6316 9.66464 39.8529C9.66464 40.0742 9.84571 40.2553 10.067 40.2553H39.9941C40.2155 40.2553 40.3965 40.0742 40.3965 39.8529C40.3965 39.6316 40.2155 39.4505 39.9941 39.4505Z" fill="#001028" stroke="#001028" stroke-width="2"/>
            <path d="M39.9941 14.02H21.887C21.6657 14.02 21.4846 14.2011 21.4846 14.4224C21.4846 14.6437 21.6657 14.8248 21.887 14.8248H39.9941C40.2155 14.8248 40.3965 14.6437 40.3965 14.4224C40.3965 14.2011 40.2155 14.02 39.9941 14.02Z" fill="#001028" stroke="#001028" stroke-width="2"/>
            <path d="M39.9941 22.5002H10.067C9.84571 22.5002 9.66464 22.6813 9.66464 22.9026C9.66464 23.1239 9.84571 23.305 10.067 23.305H39.9941C40.2155 23.305 40.3965 23.1239 40.3965 22.9026C40.3965 22.6813 40.2155 22.5002 39.9941 22.5002Z" fill="#001028" stroke="#001028" stroke-width="2"/>
            <path d="M10.0469 14.8248H18.2555C18.4768 14.8248 18.6579 14.6437 18.6579 14.4224V6.21383C18.6579 5.99252 18.4768 5.81145 18.2555 5.81145H10.0469C9.82563 5.81145 9.64456 5.99252 9.64456 6.21383V14.4224C9.64456 14.6437 9.82563 14.8248 10.0469 14.8248ZM10.4493 6.61621H17.8531V14.02H10.4493V6.61621Z" fill="#8FBE00" stroke="#8FBE00" stroke-width="2"/>
          </svg>
          <a href="${this.url}"><div>${this.fileName}</div></a>
    </div>
  `;

  }

}

export default DocumentComponent;

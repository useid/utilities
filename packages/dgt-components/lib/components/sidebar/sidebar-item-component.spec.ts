import { SidebarItemComponent } from './sidebar-item.component';

describe('SidebarItemComponent', () => {

  let component = new SidebarItemComponent();

  beforeEach(() => {

    component = window.document.createElement('sidebar-item') as SidebarItemComponent;

  });

  afterEach(() => {

    document.getElementsByTagName('html')[0].innerHTML = '';

  });

  it('should be correctly instantiated', () => {

    expect(component).toBeTruthy();

  });

  it('should add border and padding class automatically', async () => {

    window.document.body.appendChild(component);
    await component.updateComplete;

    expect(window.document.body.getElementsByTagName('sidebar-item')[0].shadowRoot.querySelectorAll('.padding')).toHaveLength(1);
    expect(window.document.body.getElementsByTagName('sidebar-item')[0].shadowRoot.querySelectorAll('.border')).toHaveLength(1);

  });

});

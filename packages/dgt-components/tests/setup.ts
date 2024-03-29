
import { AlertComponent } from '../lib/components/alerts/alert.component';
import { SidebarListItemComponent } from '../lib/components/sidebar/sidebar-list-item.component';
import { SidebarListComponent } from '../lib/components/sidebar/sidebar-list.component';
import { ContentHeaderComponent } from '../lib/components/header/content-header.component';
import { SidebarComponent } from '../lib/components/sidebar/sidebar.component';
import { SidebarItemComponent } from '../lib/components/sidebar/sidebar-item.component';
import { CardComponent } from '../lib/components/cards/card.component';
import { ListItemComponent } from '../lib/components/list-item/list-item.component';
import { SeparatorComponent } from '../lib/components/separator/separator.component';
import { CheckboxComponent } from '../lib/components/checkbox/checkbox.component';
import { WebIdComponent } from '../lib/components/authentication/webid.component';
import { define } from '../lib/util/define';

/**
 * Register tags for components.
 */
define('alert-component', AlertComponent);
define('sidebar-item', SidebarItemComponent);
define('sidebar-list-item', SidebarListItemComponent);
define('sidebar-list', SidebarListComponent);
define('sidebar-component', SidebarComponent);
define('large-card', CardComponent);
define('card-header', ContentHeaderComponent);
define('list-item', ListItemComponent);
define('separator-component', SeparatorComponent);
define('checkbox-component', CheckboxComponent);
define('webid-form', WebIdComponent);

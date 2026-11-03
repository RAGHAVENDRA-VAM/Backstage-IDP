import { createFrontendModule } from '@backstage/frontend-plugin-api';
import { AppRootWrapperBlueprint } from '@backstage/plugin-app-react';
import { SidebarContent } from './Sidebar';
import { RoleProvider } from '../RoleContext';

const roleWrapper = AppRootWrapperBlueprint.make({
  name: 'role-provider',
  params: {
    component: RoleProvider,
  },
});

export const navModule = createFrontendModule({
  pluginId: 'app',
  extensions: [roleWrapper, SidebarContent],
});

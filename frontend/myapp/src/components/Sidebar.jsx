import { NavLink } from 'react-router-dom';
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, styled
} from '@mui/material';
import {
  FindInPage as FindInPageIcon,
  Report as ReportIcon,
  Search as SearchIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { authService } from '../services/api';

const drawerWidth = 240;

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
  margin: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  '&.active': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const menuItems = [
  { text: 'Report Lost', icon: <ReportIcon />, path: '/lost' },
  { text: 'Report Found', icon: <FindInPageIcon />, path: '/found' },
  { text: 'Search Items', icon: <SearchIcon />, path: '/search' },
  { text: 'My Items', icon: <InventoryIcon />, path: '/retrievals' },
  { text: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/admin' },
];

const Sidebar = () => {
  const isUserAdmin = authService.isAdmin();
  const filteredMenuItems = menuItems.filter(item => {
    if (item.path === '/admin') {
      return isUserAdmin;
    }
    return true;
  });

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
        },
      }}
    >
      <Toolbar />
      <List>
        {filteredMenuItems.map((item) => (
          <StyledListItem key={item.text} component={NavLink} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

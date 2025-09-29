// import React from "react";
import { Menuitems, ProviderMenuitems, OrganizerMenuitems, AdminMenuitems } from "./MenuItems";
import { Box } from "@mui/material";
import {
  Logo,
  Sidebar as MUI_Sidebar,
  Menu,
  MenuItem,
  Submenu,
} from "react-mui-sidebar";
import { IconPoint } from '@tabler/icons-react';
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { Upgrade } from "./Updrade";
import { useAppContext } from "@/context/AppContext";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderMenuItems = (items: any, pathDirect: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return items.map((item: any) => {

    const Icon = item.icon ? item.icon : IconPoint;

    const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

    if (item.subheader) {
      // Display Subheader
      return (
        <Menu
          subHeading={item.subheader}
          key={item.subheader}
        ><p> </p></Menu>
      );
    }

    //If the item has children (submenu)
    if (item.children) {
      return (
        <Submenu
          key={item.id}
          title={item.title}
          icon={itemIcon}
          borderRadius='7px'
        >
          {renderMenuItems(item.children, pathDirect)}
        </Submenu>
      );
    }

    // If the item has no children, render a MenuItem

    return (
      <Box px={3} key={item.id}>
        <MenuItem
          key={item.id}
          isSelected={pathDirect === item?.href}
          borderRadius='8px'
          icon={itemIcon}
          link={item.href}
          component={Link}
        >
          {item.title}
        </MenuItem >
      </Box>

    );
  });
};

const SidebarItems = () => {
  const { user } = useAppContext();
  const pathname = usePathname();
  const pathDirect = pathname;

  return (
    < >
      <MUI_Sidebar key={user?.role} width={"100%"} showProfile={false} themeColor={"#5D87FF"} themeSecondaryColor={'#49beff'} >
        <Logo img='/images/logos/dark-logo.svg' component={Link} href="/" >Gestionainador</Logo>
        { user?.role === 'organizer' ?
          renderMenuItems(OrganizerMenuitems, pathDirect) :
          user?.role === 'provider' ?
          renderMenuItems(ProviderMenuitems, pathDirect) :
          user?.role === 'admin' ?
          renderMenuItems(AdminMenuitems, pathDirect) :
          renderMenuItems(Menuitems, pathDirect) 
        }
      </MUI_Sidebar>

    </>
  );
};
export default SidebarItems;

import { CalendarMonth } from '@mui/icons-material';
import { IconCopy, IconLayoutDashboard, IconLogin, IconMoodHappy, IconTypography, IconUserPlus, IconUserCheck, IconCalendarCheck, IconBook, IconCakeRoll, IconFileDollar, IconBackhoe } from '@tabler/icons-react';

import { uniqueId } from 'lodash';

// Ya no en uso este default item pero lo dejo para referencias, evitar errores con lo de los demás, etc.
export const Menuitems = [
  {
    navlabel: true,
    subheader: 'HOME',
  },

  {
    id: uniqueId(),
    title: 'Dashboard',
    icon: IconLayoutDashboard,
    href: '/',
  },
  {
    navlabel: true,
    subheader: 'UTILITIES',
  },
  {
    id: uniqueId(),
    title: 'Typography',
    icon: IconTypography,
    href: '/utilities/typography',
  },
  {
    id: uniqueId(),
    title: 'Shadow',
    icon: IconCopy,
    href: '/utilities/shadow',
  },
  {
    navlabel: true,
    subheader: 'AUTH',
  },
  {
    id: uniqueId(),
    title: 'Iniciar sesión',
    icon: IconLogin,
    href: '/authentication/login',
  },
  {
    id: uniqueId(),
    title: 'Registrarte',
    icon: IconUserPlus,
    href: '/authentication/register',
  },
  {
    navlabel: true,
    subheader: ' EXTRA',
  },
  {
    id: uniqueId(),
    title: 'Icons',
    icon: IconMoodHappy,
    href: '/icons',
  },
  {
    id: uniqueId(),
    title: 'Catálogo',
    icon: IconBook,
    href: '/catalog',
  },
  {
    id: uniqueId(),
    title: 'Eventos (PROVEEDORES)',
    icon: IconCalendarCheck,
    href: '/events-providers',
  },
  {
    id: uniqueId(),
    title: 'Cotizaciones (Organizador)',
    icon: IconFileDollar,
    href: '/quote_organizer',
  },
  {
    id: uniqueId(),
    title: 'Cotizaciones (Proveedor)',
    icon: IconFileDollar,
    href: '/supplier_quotes',
  },
  {
    id: uniqueId(),
    title: 'Tipos de servicio',
    icon: IconCakeRoll,
    href: '/service-types',
  },
  {
    id: uniqueId(),
    title: 'Tipos de cliente',
    icon: IconUserCheck,
    href: '/client-types',
  },
  {
    id: 'event',
    title: 'Eventos',
    icon: CalendarMonth,
    href: '/event',
  },
  {
    id: uniqueId(),
    title: 'Tipos de evento',
    icon: IconCalendarCheck,
    href: '/event-types',
  },
];

export const AdminMenuitems = [
  {
    navlabel: true,
    subheader: 'Dashboard',
  },
  {
    id: uniqueId(),
    title: 'Home',
    icon: IconLayoutDashboard,
    href: '/',
  },
  {
    id: uniqueId(),
    title: 'Tipos de servicio',
    icon: IconCakeRoll,
    href: '/service-types',
  },
  {
    id: uniqueId(),
    title: 'Tipos de cliente',
    icon: IconUserCheck,
    href: '/client-types',
  },
  {
    id: uniqueId(),
    title: 'Tipos de evento',
    icon: IconCalendarCheck,
    href: '/event-types',
  },
  {
    id: uniqueId(),
    title: 'Usuarios (WIP)',
    icon: IconBackhoe,
    href: '/wip',
  },
];

export const OrganizerMenuitems = [
  {
    navlabel: true,
    subheader: 'Dashboard',
  },
  {
    id: uniqueId(),
    title: 'Home',
    icon: IconLayoutDashboard,
    href: '/',
  },
  {
    id: 'event',
    title: 'Eventos',
    icon: CalendarMonth,
    href: '/event',
  },
  {
    id: uniqueId(),
    title: 'Estadísticas (WIP)',
    icon: IconBackhoe,
    href: '/wip',
  },
];


export const ProviderMenuitems = [
  {
    navlabel: true,
    subheader: 'Dashboard',
  },
  {
    id: uniqueId(),
    title: 'Home',
    icon: IconLayoutDashboard,
    href: '/',
  },
    {
    id: uniqueId(),
    title: 'Catálogo',
    icon: IconBook,
    href: '/catalog',
  },
  {
    id: uniqueId(),
    title: 'Eventos',
    icon: IconCalendarCheck,
    href: '/events-providers',
  },
  {
    id: uniqueId(),
    title: 'Cotizaciones',
    icon: IconFileDollar,
    href: '/supplier_quotes',
  },
  {
    id: uniqueId(),
    title: 'Tareas (WIP)',
    icon: IconBackhoe,
    href: '/wip',
  },
];

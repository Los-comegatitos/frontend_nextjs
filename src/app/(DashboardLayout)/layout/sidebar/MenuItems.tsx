import { CalendarMonth } from '@mui/icons-material';
import { IconLayoutDashboard, IconUserCheck, IconCalendarCheck, IconBook, IconCakeRoll, IconFileDollar, IconBackhoe, IconUser } from '@tabler/icons-react';

import { uniqueId } from 'lodash';

// Ya no en uso este default item pero lo dejo para referencias, evitar errores con lo de los demás, etc.
export const Menuitems = [
  {
    navlabel: true,
    subheader: 'HOME',
  }
];

export const AdminMenuitems = [
  {
    navlabel: true,
    subheader: 'Menú',
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
    title: 'Usuarios',
    icon: IconUser,
    href: '/users',
  },
];

export const OrganizerMenuitems = [
  {
    navlabel: true,
    subheader: 'Menú',
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
];


export const ProviderMenuitems = [
  {
    navlabel: true,
    subheader: 'Menú',
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
    title: 'Tareas',
    icon: IconBackhoe,
    href: '/task-providers',
  },
];

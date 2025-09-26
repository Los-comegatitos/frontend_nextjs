import {
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
  IconUserCheck,
  IconCalendarCheck,
  IconBook,
  IconCakeRoll,
  IconFileDollar,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "HOME",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "UTILITIES",
  },
  {
    id: uniqueId(),
    title: "Typography",
    icon: IconTypography,
    href: "/utilities/typography",
  },
  {
    id: uniqueId(),
    title: "Shadow",
    icon: IconCopy,
    href: "/utilities/shadow",
  },
  {
    navlabel: true,
    subheader: "AUTH",
  },
  {
    id: uniqueId(),
    title: "Iniciar sesión",
    icon: IconLogin,
    href: "/authentication/login",
  },
  {
    id: uniqueId(),
    title: "Registrarte",
    icon: IconUserPlus,
    href: "/authentication/register",
  },
  {
    navlabel: true,
    subheader: " EXTRA",
  },
  {
    id: uniqueId(),
    title: "Icons",
    icon: IconMoodHappy,
    href: "/icons",
  },
  {
    id: uniqueId(),
    title: "Catálogo",
    icon: IconBook,
    href: "/catalog",
  },
  {
    id: uniqueId(),
    title: "Eventos (PROVEEDORES)",
    icon: IconCalendarCheck,
    href: "/events-providers",
  },
  {
  id: uniqueId(),
  title: "Cotizaciones (Organizador)",
  icon: IconFileDollar,
  href: "/quote_organizer",
  },
  {
    id: uniqueId(),
    title: "Cotizaciones (Proveedor)",
    icon: IconFileDollar,
    href: "/supplier_quotes",
  },
  {
    id: uniqueId(),
    title: "Tipos de servicio",
    icon: IconCakeRoll,
    href: "/service-types",
  },
  {
    id: uniqueId(),
    title: "Tipos de cliente",
    icon: IconUserCheck,
    href: "/client-types",
  },
  {
    id: uniqueId(),
    title: "Tipos de evento",
    icon: IconCalendarCheck,
    href: "/event-types",
  },
];

export default Menuitems;

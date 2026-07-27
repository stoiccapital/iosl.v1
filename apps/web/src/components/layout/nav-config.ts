import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  LaptopMinimal,
  LayoutDashboard,
  Megaphone,
  Package,
  Scale,
  Settings,
  Target,
  Truck,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { ModuleKey } from '@factory/shared';

export type NavChild = { to: string; label: string; children?: NavChild[] };

export type NavGroup = {
  key: ModuleKey;
  label: string;
  icon: LucideIcon;
  to: string;
  children?: NavChild[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    to: '/',
  },
  {
    key: 'crm',
    label: 'CRM',
    icon: Users,
    to: '/crm',
    children: [
      { to: '/crm/leads', label: 'Leads' },
      { to: '/crm/accounts', label: 'Accounts' },
      { to: '/crm/opportunities', label: 'Opportunities' },
      { to: '/crm/forecast', label: 'Forecast' },
      { to: '/crm/commission-calculator', label: 'Commission calculator' },
      {
        to: '/crm/customers',
        label: 'Customers',
        children: [
          { to: '/success', label: 'Success' },
          { to: '/support', label: 'Support' },
          { to: '/billing/subscriptions', label: 'Subscriptions' },
          { to: '/billing/invoices', label: 'Invoices' },
          { to: '/crm/churn', label: 'Churn' },
        ],
      },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: Wallet,
    to: '/finance',
    children: [
      { to: '/finance/revenue', label: 'Revenue' },
      { to: '/finance/costs', label: 'Costs' },
      { to: '/finance/pnl', label: 'P&L' },
    ],
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    icon: Truck,
    to: '/suppliers',
    children: [
      { to: '/suppliers', label: 'Suppliers' },
      { to: '/suppliers/contracts', label: 'Contracts' },
    ],
  },
  {
    key: 'hr',
    label: 'HR',
    icon: Building2,
    to: '/hr',
    children: [
      { to: '/hr/employees', label: 'Employees' },
      { to: '/hr/freelancers', label: 'Freelancers' },
      { to: '/hr/payroll', label: 'Payroll' },
      { to: '/hr/compensation', label: 'Compensation' },
    ],
  },
  {
    key: 'recruiting',
    label: 'Recruiting',
    icon: UserPlus,
    to: '/recruiting',
    children: [
      { to: '/recruiting/positions', label: 'Positions' },
      { to: '/recruiting/candidates', label: 'Candidates' },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: Briefcase,
    to: '/projects',
    children: [
      { to: '/projects', label: 'Projects' },
      { to: '/projects/time', label: 'Time' },
    ],
  },
  {
    key: 'product',
    label: 'Product',
    icon: Package,
    to: '/product',
    children: [
      { to: '/product/roadmap', label: 'Roadmap' },
      { to: '/product/releases', label: 'Releases' },
      { to: '/product/incidents', label: 'Incidents' },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    to: '/marketing',
    children: [
      { to: '/marketing/campaigns', label: 'Campaigns' },
      { to: '/marketing/content', label: 'Content' },
      { to: '/marketing/websites', label: 'Websites' },
    ],
  },
  {
    key: 'legal',
    label: 'Legal',
    icon: Scale,
    to: '/legal',
  },
  {
    key: 'it',
    label: 'IT / Assets',
    icon: LaptopMinimal,
    to: '/it',
    children: [
      { to: '/it/devices', label: 'Devices' },
      { to: '/it/licenses', label: 'Licenses' },
    ],
  },
  {
    key: 'okrs',
    label: 'OKRs',
    icon: Target,
    to: '/okrs',
  },
  {
    key: 'docs',
    label: 'Docs',
    icon: BookOpen,
    to: '/docs',
  },
  {
    key: 'bi',
    label: 'Business Intelligence',
    icon: BarChart3,
    to: '/bi',
    children: [
      { to: '/bi/overview', label: 'Overview' },
      { to: '/bi/revenue', label: 'Revenue' },
      { to: '/bi/retention', label: 'Retention' },
      { to: '/bi/sales', label: 'Sales' },
      { to: '/bi/customers', label: 'Customers' },
      { to: '/bi/usage', label: 'Usage' },
      { to: '/bi/costs', label: 'Costs' },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    to: '/settings',
    children: [
      { to: '/settings', label: 'General' },
      { to: '/settings/users', label: 'Users' },
      { to: '/settings/roles', label: 'Roles' },
      { to: '/settings/notifications', label: 'Notifications' },
      { to: '/settings/audit', label: 'Audit log' },
    ],
  },
];

export const LEGACY_TASKS_NAV: NavChild = { to: '/tasks', label: 'Tasks' };

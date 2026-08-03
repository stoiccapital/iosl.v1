import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Calculator,
  ClipboardList,
  Clock,
  Coins,
  FileSignature,
  FileText,
  FolderKanban,
  Gauge,
  Home,
  Globe,
  Heart,
  History,
  KeyRound,
  LaptopMinimal,
  LayoutDashboard,
  LifeBuoy,
  Map,
  Megaphone,
  Package,
  Receipt,
  RefreshCw,
  Repeat,
  Rocket,
  Scale,
  Settings,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
  UserCog,
  UserMinus,
  UserPlus,
  UserSearch,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { ModuleKey } from '@factory/shared';

export type NavChild = {
  to: string;
  label: string;
  icon?: LucideIcon;
  children?: NavChild[];
};

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
      { to: '/crm', label: 'Overview', icon: Home },
      { to: '/crm/leads', label: 'Leads', icon: Sparkles },
      { to: '/crm/accounts', label: 'Accounts', icon: Building2 },
      { to: '/crm/opportunities', label: 'Opportunities', icon: Target },
      {
        to: '/crm/customers',
        label: 'Customers',
        icon: Users,
        children: [
          { to: '/success', label: 'Success', icon: Star },
          { to: '/support', label: 'Support', icon: LifeBuoy },
          { to: '/billing/subscriptions', label: 'Subscriptions', icon: Repeat },
          { to: '/billing/invoices', label: 'Invoices', icon: Receipt },
          { to: '/crm/churn', label: 'Churn', icon: UserMinus },
        ],
      },
      { to: '/crm/forecast', label: 'Forecast', icon: TrendingUp },
      { to: '/crm/commission-calculator', label: 'Commission calculator', icon: Calculator },
    ],
  },
  {
    key: 'finance',
    label: 'Finance',
    icon: Wallet,
    to: '/finance',
    children: [
      { to: '/finance/revenue', label: 'Revenue', icon: ArrowUpRight },
      { to: '/finance/costs', label: 'Costs', icon: ArrowDownRight },
      { to: '/finance/expenses', label: 'Expenses', icon: Receipt },
      { to: '/finance/pnl', label: 'P&L', icon: BarChart3 },
    ],
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    icon: Truck,
    to: '/suppliers',
    children: [
      { to: '/suppliers', label: 'Suppliers', icon: Package },
      { to: '/suppliers/contracts', label: 'Contracts', icon: FileSignature },
    ],
  },
  {
    key: 'hr',
    label: 'HR',
    icon: Building2,
    to: '/hr',
    children: [
      { to: '/hr/employees', label: 'Employees', icon: Users },
      { to: '/hr/freelancers', label: 'Freelancers', icon: UserCog },
      { to: '/hr/payroll', label: 'Payroll', icon: Wallet },
      { to: '/hr/compensation', label: 'Compensation', icon: Coins },
    ],
  },
  {
    key: 'recruiting',
    label: 'Recruiting',
    icon: UserPlus,
    to: '/recruiting',
    children: [
      { to: '/recruiting/positions', label: 'Positions', icon: BriefcaseBusiness },
      { to: '/recruiting/candidates', label: 'Candidates', icon: UserSearch },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: Briefcase,
    to: '/projects',
    children: [
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/projects/time', label: 'Time', icon: Clock },
    ],
  },
  {
    key: 'product',
    label: 'Product',
    icon: Package,
    to: '/product',
    children: [
      { to: '/product/roadmap', label: 'Roadmap', icon: Map },
      { to: '/product/releases', label: 'Releases', icon: Rocket },
      { to: '/product/incidents', label: 'Incidents', icon: AlertTriangle },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: Megaphone,
    to: '/marketing',
    children: [
      { to: '/marketing/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/marketing/content', label: 'Content', icon: FileText },
      { to: '/marketing/websites', label: 'Websites', icon: Globe },
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
      { to: '/it/devices', label: 'Devices', icon: LaptopMinimal },
      { to: '/it/licenses', label: 'Licenses', icon: KeyRound },
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
      { to: '/bi/overview', label: 'Overview', icon: Gauge },
      { to: '/bi/revenue', label: 'Revenue', icon: TrendingUp },
      { to: '/bi/retention', label: 'Retention', icon: RefreshCw },
      { to: '/bi/sales', label: 'Sales', icon: ShoppingCart },
      { to: '/bi/customers', label: 'Customers', icon: Heart },
      { to: '/bi/usage', label: 'Usage', icon: Activity },
      { to: '/bi/costs', label: 'Costs', icon: TrendingDown },
    ],
  },
  {
    key: 'settings',
    label: 'Settings',
    icon: Settings,
    to: '/settings',
    children: [
      { to: '/settings', label: 'General', icon: SlidersHorizontal },
      { to: '/settings/users', label: 'Users', icon: Users },
      { to: '/settings/roles', label: 'Roles', icon: ShieldCheck },
      { to: '/settings/notifications', label: 'Notifications', icon: Bell },
      { to: '/settings/audit', label: 'Audit log', icon: History },
    ],
  },
];

export const LEGACY_TASKS_NAV: NavChild = { to: '/tasks', label: 'Tasks', icon: ClipboardList };

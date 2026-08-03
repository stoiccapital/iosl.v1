import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PublicLegalPage } from './pages/public/PublicLegalPage';
import {
  PublicLocaleRedirect,
  PublicPage,
  PublicRootRedirect,
} from './pages/public/PublicSitePage';
import { HomePage } from './pages/HomePage';
import { TasksPage } from './pages/TasksPage';
import { AccountsPage } from './pages/crm/AccountsPage';
import { ChurnPage } from './pages/crm/ChurnPage';
import { CommissionCalculatorPage } from './pages/crm/CommissionCalculatorPage';
import { CustomersPage } from './pages/crm/CustomersPage';
import { ForecastPage } from './features/crm/forecast/ForecastPage';
import { LeadsPage } from './pages/crm/LeadsPage';
import { AccountDetailPage } from './pages/crm/AccountDetailPage';
import { CrmDashboardPage } from './pages/crm/CrmDashboardPage';
import { OpportunitiesPage } from './pages/crm/OpportunitiesPage';
import { OpportunityDetailPage } from './pages/crm/OpportunityDetailPage';
import { ContractsPage } from './pages/suppliers/ContractsPage';
import { SuppliersPage } from './pages/suppliers/SuppliersPage';
import { CompensationPage } from './pages/hr/CompensationPage';
import { EmployeesPage } from './pages/hr/EmployeesPage';
import { FreelancersPage } from './pages/hr/FreelancersPage';
import { PayrollPage } from './pages/hr/PayrollPage';
import { CostsPage } from './pages/finance/CostsPage';
import { ExpensesPage } from './pages/finance/ExpensesPage';
import { PnlPage } from './pages/finance/PnlPage';
import { RevenuePage } from './pages/finance/RevenuePage';
import { CandidatesPage } from './pages/recruiting/CandidatesPage';
import { PositionsPage } from './pages/recruiting/PositionsPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { TimePage } from './pages/projects/TimePage';
import { BiCostsPage } from './pages/bi/BiCostsPage';
import { BiCustomersPage } from './pages/bi/BiCustomersPage';
import { BiOverviewPage } from './pages/bi/BiOverviewPage';
import { BiRetentionPage } from './pages/bi/BiRetentionPage';
import { BiRevenuePage } from './pages/bi/BiRevenuePage';
import { BiSalesPage } from './pages/bi/BiSalesPage';
import { BiUsagePage } from './pages/bi/BiUsagePage';
import { GeneralPage } from './pages/settings/GeneralPage';
import { RolesPage } from './pages/settings/RolesPage';
import { UsersPage } from './pages/settings/UsersPage';
import { AuditPage } from './pages/settings/AuditPage';
import { NotificationsPage } from './pages/settings/NotificationsPage';
import { CustomerSuccessPage } from './features/success/CustomerSuccessPage';
import { TicketsPage } from './pages/support/TicketsPage';
import { InvoicesPage } from './pages/billing/InvoicesPage';
import { SubscriptionsPage } from './pages/billing/SubscriptionsPage';
import { RoadmapPage } from './pages/product/RoadmapPage';
import { ReleasesPage } from './pages/product/ReleasesPage';
import { IncidentsPage } from './pages/product/IncidentsPage';
import { CampaignsPage } from './pages/marketing/CampaignsPage';
import { ContentPage } from './pages/marketing/ContentPage';
import { WebsiteEditPage } from './pages/marketing/WebsiteEditPage';
import { WebsiteNewPage } from './pages/marketing/WebsiteNewPage';
import { WebsiteSubmissionsPage } from './pages/marketing/WebsiteSubmissionsPage';
import { WebsitesPage } from './pages/marketing/WebsitesPage';
import { LegalPage } from './pages/legal/LegalPage';
import { DevicesPage } from './pages/it/DevicesPage';
import { LicensesPage } from './pages/it/LicensesPage';
import { OkrsPage } from './pages/okrs/OkrsPage';
import { DocsPage } from './pages/docs/DocsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/sites/:slug" element={<PublicRootRedirect />} />
      <Route path="/sites/:slug/:locale" element={<PublicLocaleRedirect />} />
      <Route path="/sites/:slug/:locale/ride" element={<PublicPage kind="ride" />} />
      <Route path="/sites/:slug/:locale/drive" element={<PublicPage kind="drive" />} />
      <Route
        path="/sites/:slug/:locale/impressum"
        element={<PublicLegalPage kind="impressum" />}
      />
      <Route
        path="/sites/:slug/:locale/datenschutz"
        element={<PublicLegalPage kind="privacy" />}
      />
      <Route path="/*" element={<InternalRoutes />} />
    </Routes>
  );
}

function InternalRoutes() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tasks" element={<TasksPage />} />

        {/* CRM */}
        <Route path="/crm" element={<CrmDashboardPage />} />
        <Route path="/crm/leads" element={<LeadsPage />} />
        <Route path="/crm/accounts" element={<AccountsPage />} />
        <Route path="/crm/accounts/:id" element={<AccountDetailPage />} />
        <Route path="/crm/opportunities" element={<OpportunitiesPage />} />
        <Route path="/crm/opportunities/:id" element={<OpportunityDetailPage />} />
        <Route path="/crm/forecast" element={<ForecastPage />} />
        <Route path="/crm/commission-calculator" element={<CommissionCalculatorPage />} />
        <Route path="/crm/customers" element={<CustomersPage />} />
        <Route path="/crm/churn" element={<ChurnPage />} />

        {/* Customer Success */}
        <Route path="/success" element={<CustomerSuccessPage />} />

        {/* Support */}
        <Route path="/support" element={<TicketsPage />} />

        {/* Billing */}
        <Route path="/billing" element={<Navigate to="/billing/subscriptions" replace />} />
        <Route path="/billing/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/billing/invoices" element={<InvoicesPage />} />

        {/* Finance */}
        <Route path="/finance" element={<Navigate to="/finance/revenue" replace />} />
        <Route path="/finance/revenue" element={<RevenuePage />} />
        <Route path="/finance/costs" element={<CostsPage />} />
        <Route path="/finance/expenses" element={<ExpensesPage />} />
        <Route path="/finance/pnl" element={<PnlPage />} />

        {/* Suppliers */}
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/suppliers/contracts" element={<ContractsPage />} />

        {/* HR */}
        <Route path="/hr" element={<Navigate to="/hr/employees" replace />} />
        <Route path="/hr/employees" element={<EmployeesPage />} />
        <Route path="/hr/freelancers" element={<FreelancersPage />} />
        <Route path="/hr/payroll" element={<PayrollPage />} />
        <Route path="/hr/compensation" element={<CompensationPage />} />

        {/* Recruiting */}
        <Route path="/recruiting" element={<Navigate to="/recruiting/positions" replace />} />
        <Route path="/recruiting/positions" element={<PositionsPage />} />
        <Route path="/recruiting/candidates" element={<CandidatesPage />} />

        {/* Projects */}
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/time" element={<TimePage />} />

        {/* Product */}
        <Route path="/product" element={<Navigate to="/product/roadmap" replace />} />
        <Route path="/product/roadmap" element={<RoadmapPage />} />
        <Route path="/product/releases" element={<ReleasesPage />} />
        <Route path="/product/incidents" element={<IncidentsPage />} />

        {/* Marketing */}
        <Route path="/marketing" element={<Navigate to="/marketing/campaigns" replace />} />
        <Route path="/marketing/campaigns" element={<CampaignsPage />} />
        <Route path="/marketing/content" element={<ContentPage />} />
        <Route path="/marketing/websites" element={<WebsitesPage />} />
        <Route path="/marketing/websites/new" element={<WebsiteNewPage />} />
        <Route path="/marketing/websites/:id" element={<WebsiteEditPage />} />
        <Route
          path="/marketing/websites/:id/submissions"
          element={<WebsiteSubmissionsPage />}
        />

        {/* Legal */}
        <Route path="/legal" element={<LegalPage />} />

        {/* IT */}
        <Route path="/it" element={<Navigate to="/it/devices" replace />} />
        <Route path="/it/devices" element={<DevicesPage />} />
        <Route path="/it/licenses" element={<LicensesPage />} />

        {/* OKRs */}
        <Route path="/okrs" element={<OkrsPage />} />

        {/* Docs */}
        <Route path="/docs" element={<DocsPage />} />

        {/* BI */}
        <Route path="/bi" element={<Navigate to="/bi/overview" replace />} />
        <Route path="/bi/overview" element={<BiOverviewPage />} />
        <Route path="/bi/customers" element={<BiCustomersPage />} />
        <Route path="/bi/revenue" element={<BiRevenuePage />} />
        <Route path="/bi/retention" element={<BiRetentionPage />} />
        <Route path="/bi/sales" element={<BiSalesPage />} />
        <Route path="/bi/usage" element={<BiUsagePage />} />
        <Route path="/bi/costs" element={<BiCostsPage />} />

        {/* Settings */}
        <Route path="/settings" element={<GeneralPage />} />
        <Route path="/settings/users" element={<UsersPage />} />
        <Route path="/settings/roles" element={<RolesPage />} />
        <Route path="/settings/audit" element={<AuditPage />} />
        <Route path="/settings/notifications" element={<NotificationsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

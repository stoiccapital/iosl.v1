import { accountContactsHandlers } from './account-contacts';
import { accountNotesHandlers } from './account-notes';
import { auditHandlers } from './audit';
import { biHandlers } from './bi';
import { billingHandlers } from './billing';
import { churnHandlers } from './churn';
import { compensationHandlers } from './compensation';
import { crmHandlers } from './crm';
import { dashboardHandlers } from './dashboard';
import { docsHandlers } from './docs';
import { expensesHandlers } from './expenses';
import { financeHandlers } from './finance';
import { healthHandlers } from './health';
import { itHandlers } from './it';
import { legalHandlers } from './legal';
import { marketingHandlers } from './marketing';
import { meHandlers } from './me';
import { okrHandlers } from './okrs';
import { payrollHandlers } from './payroll';
import { peopleHandlers } from './people';
import { productHandlers } from './product';
import { productsHandlers } from './products';
import { projectHandlers } from './projects';
import { recruitingHandlers } from './recruiting';
import { searchHandlers } from './search';
import { subscriptionFlowHandlers } from './subscription-flow';
import { supplierHandlers } from './suppliers';
import { supportHandlers } from './support';
import { tasksHandlers } from './tasks';
import { usersHandlers } from './users';
import { websitesHandlers } from './websites';

export const handlers = [
  ...accountContactsHandlers,
  ...accountNotesHandlers,
  ...auditHandlers,
  ...biHandlers,
  ...billingHandlers,
  ...churnHandlers,
  ...compensationHandlers,
  ...crmHandlers,
  ...dashboardHandlers,
  ...docsHandlers,
  ...expensesHandlers,
  ...financeHandlers,
  ...healthHandlers,
  ...itHandlers,
  ...legalHandlers,
  ...marketingHandlers,
  ...meHandlers,
  ...okrHandlers,
  ...payrollHandlers,
  ...peopleHandlers,
  ...productHandlers,
  ...productsHandlers,
  ...projectHandlers,
  ...recruitingHandlers,
  ...searchHandlers,
  ...subscriptionFlowHandlers,
  ...supplierHandlers,
  ...supportHandlers,
  ...tasksHandlers,
  ...usersHandlers,
  ...websitesHandlers,
];

import { auditHandlers } from './audit';
import { biHandlers } from './bi';
import { billingHandlers } from './billing';
import { churnHandlers } from './churn';
import { compensationHandlers } from './compensation';
import { crmHandlers } from './crm';
import { docsHandlers } from './docs';
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
import { supplierHandlers } from './suppliers';
import { supportHandlers } from './support';
import { tasksHandlers } from './tasks';
import { usersHandlers } from './users';
import { websitesHandlers } from './websites';

export const handlers = [
  ...auditHandlers,
  ...biHandlers,
  ...billingHandlers,
  ...churnHandlers,
  ...compensationHandlers,
  ...crmHandlers,
  ...docsHandlers,
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
  ...supplierHandlers,
  ...supportHandlers,
  ...tasksHandlers,
  ...usersHandlers,
  ...websitesHandlers,
];

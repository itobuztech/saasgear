import database from '~/config/database.config';
import { TABLES } from '~/constants/database.constant';

const TABLE = TABLES.companies;

// export const companyColumns = {
//   id: 'companies.id',
//   name: 'companies.name',
//   email: 'companies.email',
//   url: 'companies.url',
//   created_at: 'companies.created_at',
//   update_at: 'companies.updated_at',
//   deleted_at: 'companies.deleted_at',
// };

export default function insertCompany(name, email, url) {
  const data = { name, email, url };
  const query = database(TABLE).insert(data).then(() => console.log('insert successfully'));
  return query;
}

// export function listCompany() {
//     console.log('hi');
//   const query = database(TABLE).select(companyColumns)
//   console.log(query);
//   return query;
// }

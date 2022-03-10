import database from '~/config/database.config';
import { TABLES } from '~/constants/database.constant';

const TABLE = TABLES.companies;

export async function insertCompany(name, email, url) {
  const data = { name, email, url };
  let t;
  try {
    t = await database.transaction();
    await database(TABLE).insert(data);
    await t.commit();
    return ({ msg: 'Inserted Company successfully.' });
  } catch (error) {
    console.log('error:', error);
    if (error) t.rollback();
    return new Error(error);
  }
}

export async function listCompany() {
  const query = database(TABLE);
  return query;
}

export const companyColumns = {
  id: 'companies.id',
  name: 'companies.name',
  deleted_at: 'companies.deleted_at',
};

export async function findCompanyDetail(name) {
  return database(TABLE).select(companyColumns).where({ [companyColumns.name]: name }).whereNull(companyColumns.deleted_at);
}

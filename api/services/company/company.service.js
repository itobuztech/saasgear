import { insertCompany, findCompanyDetail, listCompany } from '~/repository/company.repository';

export async function addCompany(name, email, url) {
  const addCompanyDetails = await insertCompany(name, email, url);
  return addCompanyDetails;
}

export async function getAllCompany() {
  const allCompany = await listCompany();
  return allCompany;
}

export async function getCompanyDetails(company) {
  const companyDetails = await findCompanyDetail(company);
  return companyDetails;
}

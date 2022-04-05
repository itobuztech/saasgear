/* eslint-disable wrap-iife */
import dotenv from 'dotenv';
import { resolve, join } from 'path';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import Apollo from 'apollo-server-express';
import Sentry from '@sentry/node';

import accessLogStream from './middlewares/logger.middleware';
import RootSchema from './graphql/root.schema';
import RootResolver from './graphql/root.resolver';
import getUserLogined from './services/authentication/get-user-logined.service';
import stripeHooks from './services/stripe/webhooks.servive';
import { generatePassword } from './helpers/hashing.helper';
import { addCompany, getAllCompany, getCompanyDetails } from './services/company/company.service';

// Newest1 - Start
import { getAllUsers, setUserLogTime, insertUsers, deleteUsers } from './services/user/users.service';
// Newest1 - End

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const corsOptions = {
  optionsSuccessStatus: 200,
  credentials: true,
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

(function startServer() {
  app.use(morgan('combined', { stream: accessLogStream }));
  app.use(cors(corsOptions));
  app.use(express.static(join(resolve(), 'public', 'uploads')));
  app.use(cookieParser());

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
  app.post('/stripe-hooks', bodyParser.raw({ type: 'application/json' }), stripeHooks);

  // Newest1 - Start

  app.get('/all-users', async (req, res) => {
    const allUsers = await getAllUsers();
    const UserDetails = {
      status: 200,
      data: allUsers
    };
    res.send(UserDetails);
  });

  // For testing
  app.put('/users/:userId/update-log-time', async (req, res) => {
    const userId = req.params && req.params.userId;
    const lastLoggedAt = new Date();

    if (!userId) {
      res.send({ msg: 'Please provide a proper id.' });
    }

    const updatedUser = await setUserLogTime(userId, lastLoggedAt);
    console.log('updatedUser:', updatedUser);
    res.send(updatedUser);
  });

  // Newest1 - End

  const serverGraph = new Apollo.ApolloServer({
    schema: Apollo.makeExecutableSchema({
      typeDefs: RootSchema,
      resolvers: RootResolver,
    }),
    plugins: [
      {
        requestDidStart() {
          return {
            didEncounterErrors(ctx) {
              if (!ctx.operation) return;
              for (const err of ctx.errors) {
                if (err instanceof Apollo.ApolloError) {
                  continue;
                }

                Sentry.withScope((scope) => {
                  scope.setTag('kind', ctx.operation.operation);
                  scope.setExtra('query', ctx.request.query);
                  scope.setExtra('variables', ctx.request.variables);

                  if (err.path) {
                    scope.addBreadcrumb({
                      category: 'query-path',
                      message: err.path.join(' > '),
                      level: Sentry.Severity.Debug,
                    });
                  }

                  const transactionId = ctx.request.http.headers.get('x-transaction-id');
                  if (transactionId) {
                    scope.setTransactionName(transactionId);
                  }
                  Sentry.captureException(err);
                });
              }
            },
          };
        },
      },
    ],
    context: async ({ req, res }) => {
      const { cookies } = req;
      const bearerToken = cookies.token || null;
      const user = await getUserLogined(bearerToken, res);
      return {
        user,
        res,
      };
    },
  });

  serverGraph.applyMiddleware({ app, cors: corsOptions });
  Sentry.init({ dsn: process.env.SENTRY_DSN });

  app.post('/addCompanies', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const { name, email, url } = JSON.parse(req.body);
      const insertCompanies = await addCompany(name, email, url);
      res.json(insertCompanies);
    } catch (error) {
      res.status(400).json(error);
    }
  });

  app.get('/listCompanies', async (req, res) => {
    try {
      const listCompanies = await getAllCompany();
      const result = listCompanies.map(({ ...restProps }) => restProps);
      res.send(result);
    } catch (error) {
      res.status(400).json(error);
    }
  });

  app.post('/addUser', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const { name, email, password, position, company, avatarUrl, provider, providerId } = JSON.parse(req.body);
      const getCompanyDetailByName = await getCompanyDetails(company);
      const companyId = getCompanyDetailByName[0].id;
      const passwordHashed = await generatePassword(password);
      const data = {
        name,
        email,
        password: passwordHashed,
        position,
        company,
        avatar_url: avatarUrl,
        provider,
        provider_id: providerId,
        company_id: companyId,
      };
      const insertUserDetails = await insertUsers(data);
      res.send(insertUserDetails);
    } catch (error) {
      res.status(400).json(error);
    }
  });

  app.post('/deleteUser/:email', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    try {
      const emailId = req.params.email;
      const deleteUser = await deleteUsers(emailId);
      res.json(deleteUser);
    } catch (error) {
      res.status(400).json(error);
    }
  });

  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
})();

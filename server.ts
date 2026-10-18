import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { createServer as createViteServer } from 'vite';

import { config, isProductionEnvironment } from './server/config/index.js';
import { logger } from './server/utils/logger.js';
import { openapiSpecification } from './server/swagger/openapiSpec.js';
import { runMigrations } from './server/db/migrate.js';
import { AuthService } from './server/services/authService.js';
import { authenticateJWT, AuthenticatedRequest } from './server/middleware/auth.js';
import { securityHeadersMiddleware } from './server/middleware/securityHeaders.js';
import { startRateLimitCleanup } from './server/middleware/rateLimiter.js';

// Route handlers
import healthRoutes from './server/routes/v1/healthRoutes.js';
import authRoutes from './server/routes/v1/auth.js';
import saasRoutes from './server/routes/v1/saasRoutes.js';
import productionOnboardingRoutes from './server/routes/v1/productionOnboardingRoutes.js';
import realBusinessRoutes from './server/routes/v1/realBusinessRoutes.js';
import customersRoutes from './server/routes/v1/customers.js';
import suppliersRoutes from './server/routes/v1/suppliers.js';
import customersAndSuppliersRoutes from './server/routes/v1/customersAndSuppliers.js';
import productsRoutes from './server/routes/v1/products.js';
import invoicesRoutes from './server/routes/v1/invoices.js';
import purchaseInvoicesRoutes from './server/routes/v1/purchaseInvoices.js';
import paymentsRoutes from './server/routes/v1/payments.js';
import ledgerRoutes from './server/routes/v1/ledger.js';
import reportsRoutes from './server/routes/v1/reports.js';
import companiesRoutes from './server/routes/v1/companies.js';
import subscriptionRoutes from './server/routes/v1/subscriptionRoutes.js';
import fileRoutes from './server/routes/v1/fileRoutes.js';
import exportRoutes from './server/routes/v1/exportRoutes.js';
import dataGovernanceRoutes from './server/routes/v1/dataGovernanceRoutes.js';
import observabilityRoutes from './server/routes/v1/observabilityRoutes.js';
import emailRoutes from './server/routes/v1/emailRoutes.js';
import schedulerRoutes from './server/routes/v1/schedulerRoutes.js';
import whatsappRoutes from './server/routes/v1/whatsapp.js';
import backupRoutes from './server/routes/v1/backupRoutes.js';
import financialReportingRoutes from './server/routes/v1/financialReportingRoutes.js';
import notificationsRoutes from './server/routes/v1/notifications.js';
import importRoutes from './server/routes/v1/import.js';
import ocrRoutes from './server/routes/v1/ocr.js';
import usersRoutes from './server/routes/v1/users.js';
import rolesRoutes from './server/routes/v1/roles.js';
import aiRoutes from './server/routes/v1/ai.js';
import auditLogsRoutes from './server/routes/v1/auditLogs.js';
import inventoryRoutes from './server/routes/v1/inventory.js';
import settingsRoutes from './server/routes/v1/settingsRoutes.js';
import controlCenterRoutes from './server/routes/v1/controlCenterRoutes.js';
import exchangeRatesRoutes from './server/routes/v1/exchangeRates.js';
import systemMetricsRoutes from './server/routes/v1/systemMetricsRoutes.js';
import posRoutes from './server/routes/v1/pos.js';
import testRoutes from './server/routes/v1/testRoutes.js';

const app = express();
const PORT = 3000;

// Security: Disable Express signature and enforce central HTTP security response headers
app.disable('x-powered-by');

// Production-Only Trusted Proxy Configuration (CR-20260925-SEC06-AUTH-RATE-LIMITING-IMPLEMENTATION-01):
// In production Cloud Run behind Google Front End / Cloud Load Balancer (1 proxy hop),
// trust exactly 1 proxy hop so req.ip extracts the genuine client IP from X-Forwarded-For.
// In development/test, keep trust proxy disabled to prevent spoofed X-Forwarded-For headers from spoofing client identity.
if (isProductionEnvironment()) {
  app.set('trust proxy', 1);
}

// Start periodic cleanup of expired rate-limit records
startRateLimitCleanup();

app.use(securityHeadersMiddleware);

// 0. Quick Top-Level Health Probes for Cloud Run & Load Balancers
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. Basic Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-ID', 'Idempotency-Key'],
}));

app.use(express.json({
  limit: '50mb',
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 2. Swagger Documentation
app.use('/api-docs', ...(swaggerUi.serve as any), swaggerUi.setup(openapiSpecification) as any);
app.use('/api/docs', ...(swaggerUi.serve as any), swaggerUi.setup(openapiSpecification) as any);

// 3. Authentication Routes
app.use('/api/v1/auth', authRoutes);

// Legacy auth route fallbacks for backward compatibility
app.post('/api/v1/auth/register', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = await AuthService.register(req.body, req.ip);
    res.status(201).json({
      success: true,
      data: result,
      ...result,
      message: 'تم تسجيل الحساب وإنشاء المؤسسة بنجاح',
    });
  } catch (err: any) {
    const status = err.statusCode || 400;
    res.status(status).json({
      success: false,
      error: err.message || 'حدث خطأ أثناء تسجيل الحساب',
      code: err.code || 'REGISTRATION_ERROR',
    });
  }
});

app.post('/api/v1/auth/login', async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = await AuthService.login(req.body, req.ip);
    res.json({
      success: true,
      data: result,
      ...result,
      message: 'تم تسجيل الدخول بنجاح',
    });
  } catch (err: any) {
    const status = err.statusCode || 401;
    res.status(status).json({
      success: false,
      error: err.message || 'فشل تسجيل الدخول، يرجى التحقق من البريد أو كلمة المرور',
      code: err.code || 'AUTH_ERROR',
    });
  }
});

app.get('/api/v1/auth/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      tenantId: req.user?.companyId,
    },
    user: req.user,
    tenantId: req.user?.companyId,
  });
});

// 4. API v1 Core Routes
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/roles', rolesRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/audit-logs', auditLogsRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/control-center', controlCenterRoutes);
app.use('/api/v1/exchange-rates', exchangeRatesRoutes);
app.use('/api/v1/system', systemMetricsRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/api/v1/customers', customersRoutes);
app.use('/api/v1/suppliers', suppliersRoutes);
app.use('/api/v1/customers-and-suppliers', customersAndSuppliersRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/invoices', invoicesRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/purchase-invoices', purchaseInvoicesRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/ledger', ledgerRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/companies', companiesRoutes);
app.use('/api/v1/company', companiesRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/subscription', subscriptionRoutes);
app.use('/api/v1/files', fileRoutes);
app.use('/api/v1/exports', exportRoutes);
app.use('/api/v1/export', exportRoutes);
app.use('/api/v1/emails', emailRoutes);
app.use('/api/v1/scheduler', schedulerRoutes);
app.use('/api/v1/backups', backupRoutes);
app.use('/api/v1/backup', backupRoutes);
app.use('/api/v1/financial-reports', financialReportingRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/import', importRoutes);
app.use('/api/v1/ocr', ocrRoutes);
app.use('/api/v1/test', testRoutes);
app.use('/api/v1/business', realBusinessRoutes);
app.use('/api/v1/governance', dataGovernanceRoutes);
app.use('/api/v1/saas', saasRoutes);
app.use('/api/v1', healthRoutes);
app.use('/api/v1', productionOnboardingRoutes);
app.use('/api/v1', observabilityRoutes);

// Catch-all 404 handler for API routes (returns JSON so client fetches never receive HTML)
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `المسار المطلوب غير موجود: ${req.method} ${req.path}`,
    code: 'API_ROUTE_NOT_FOUND',
  });
});

// 5. Global Error Handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) {
    logger.error(`[Unhandled Error] ${req.method} ${req.path}: ${err.message}`, { stack: err.stack });
  } else {
    logger.warn(`[Client Error] ${req.method} ${req.path} (${status}): ${err.message}`);
  }
  res.status(status).json({
    success: false,
    error: err.message || 'حدث خطأ داخلي في الخادم',
    code: err.code || (status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'),
  });
});

// 6. Vite / Static serving and Server Boot
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind and listen on port 3000 immediately so Cloud Run health and TCP startup probes succeed instantly
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT} [Env: ${config.env}, DB: ${config.db.provider}]`);
  });

  // Run database migrations and schema integrity check
  try {
    await runMigrations();
    logger.info('Database migrations and schemas initialized successfully.');
  } catch (migErr: any) {
    logger.error('Failed to run database migrations on startup:', migErr);
  }
}

start().catch((err) => {
  logger.error('Failed to start server', err);
  process.exit(1);
});

export default app;

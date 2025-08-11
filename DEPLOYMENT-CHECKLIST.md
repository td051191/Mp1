# 🚀 Minh Phát Deployment Checklist

## Pre-Deployment Setup

### 1. Database Setup
- [ ] Choose database hosting (Neon, PlanetScale, Supabase, Railway)
- [ ] Create production database
- [ ] Run migration: `npm run db:migrate`
- [ ] Test database connection
- [ ] Backup SQLite data: `npm run db:backup`

### 2. Environment Configuration
- [ ] Copy `.env.example` to `.env.production`
- [ ] Set `DATABASE_URL` to production database
- [ ] Generate secure `SESSION_SECRET` and `JWT_SECRET`
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Set `NODE_ENV=production`

### 3. Code Preparation
- [ ] Run tests: `npm run test`
- [ ] Build locally: `npm run build`
- [ ] Check TypeScript: `npm run typecheck`
- [ ] Format code: `npm run format.fix`

## Deployment Options

### Option A: Vercel (Easiest)
- [ ] Push code to GitHub repository
- [ ] Connect repository to Vercel account
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy: `npm run deploy:vercel`
- [ ] Configure custom domain in Vercel settings

### Option B: Railway
- [ ] Create account at railway.app
- [ ] Connect GitHub repository
- [ ] Add PostgreSQL service
- [ ] Set environment variables
- [ ] Deploy automatically on git push

### Option C: Fly.io
- [ ] Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
- [ ] Login: `fly auth login`
- [ ] Launch app: `fly launch`
- [ ] Set secrets: `fly secrets set DATABASE_URL=xxx`
- [ ] Deploy: `npm run deploy:fly`

## Domain Setup

### 1. Domain Registration
- [ ] Purchase domain (recommended: .com, .shop, .store)
- [ ] Configure DNS records
- [ ] Point domain to hosting provider

### 2. SSL Certificate
- [ ] Verify SSL certificate is active
- [ ] Test HTTPS redirect
- [ ] Update CORS origins with new domain

## Post-Deployment Testing

### 1. Frontend Testing
- [ ] Homepage loads correctly
- [ ] Product pages display properly
- [ ] Categories navigation works
- [ ] Language switching functions
- [ ] Mobile responsiveness

### 2. Admin Panel Testing
- [ ] Admin login works with credentials
- [ ] Products CRUD operations
- [ ] Categories management
- [ ] Content management
- [ ] Settings page loads
- [ ] Data export functionality

### 3. Database Testing
- [ ] Data persists between sessions
- [ ] Admin user authentication
- [ ] Product creation/editing
- [ ] Database backup/restore

## Security Checklist

- [ ] Admin panel requires authentication
- [ ] Passwords are hashed (MD5 → bcrypt recommended)
- [ ] HTTPS enabled and enforced
- [ ] CORS properly configured
- [ ] Environment variables secured
- [ ] Database access restricted

## Performance Optimization

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Implement caching headers
- [ ] Optimize images (WebP format)
- [ ] Monitor Core Web Vitals

## Monitoring Setup

- [ ] Set up uptime monitoring
- [ ] Configure error tracking (Sentry)
- [ ] Enable analytics (Google Analytics)
- [ ] Monitor database performance
- [ ] Set up backup automation

## Production URLs Structure

```
Main Site:        https://yourdomain.com
Admin Panel:      https://yourdomain.com/admin/login
API Endpoints:    https://yourdomain.com/api/*
```

## Emergency Procedures

### Database Issues
1. Check connection string
2. Verify database service status
3. Restore from backup if needed
4. Contact database provider support

### Site Down
1. Check hosting provider status
2. Review deployment logs
3. Rollback to previous version
4. Check domain/DNS configuration

### Admin Access Issues
1. Verify admin user exists in database
2. Check session configuration
3. Test with incognito/private browser
4. Reset admin password if needed

## Maintenance

### Regular Tasks
- [ ] Weekly database backups
- [ ] Monthly security updates
- [ ] Quarterly dependency updates
- [ ] Monitor disk space usage
- [ ] Review error logs

### Updates
- [ ] Test in staging environment first
- [ ] Backup before major updates
- [ ] Monitor after deployment
- [ ] Have rollback plan ready

## Success Criteria

✅ **Deployment is successful when:**
- Site loads on custom domain with HTTPS
- All pages render correctly
- Admin panel authentication works
- Database operations function properly
- Mobile site is responsive
- Core Web Vitals scores are good

## Support Resources

- **Hosting Issues**: Contact your hosting provider support
- **Database Issues**: Check your database provider documentation
- **Code Issues**: Review deployment logs and error messages
- **DNS Issues**: Use tools like `dig` or online DNS checkers

---

**Estimated Deployment Time**: 2-4 hours for first deployment, 30 minutes for subsequent updates.

**Recommended Budget**: 
- Domain: $10-15/year
- Hosting: $0-20/month (depending on traffic)
- Database: $0-10/month (most plans include free tier)

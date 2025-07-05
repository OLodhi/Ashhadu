# Next.js Deployment Checklist

## 🚀 Adding New Features - Step-by-Step Process

### 1. Before Creating New Routes/Pages
- [ ] Check current server status: `ps aux | grep "next dev"`
- [ ] Note current working routes for comparison

### 2. After Creating New Files
- [ ] **Always run TypeScript check**: `npx tsc --noEmit --skipLibCheck`
- [ ] Fix any TypeScript errors before proceeding
- [ ] Check file structure: `ls -la src/app/[new-route]/`

### 3. Server Restart Process (CRITICAL)
When adding new routes, **ALWAYS** restart the server:

```bash
# 1. Kill existing processes
pkill -f "next dev"
pkill -f "next-server" 
sleep 2

# 2. Clear Next.js cache (important!)
rm -rf .next

# 3. Restart development server
npm run dev
```

### 4. Verification Steps
- [ ] Wait for "✓ Ready in Xs" message
- [ ] Test homepage: `curl http://localhost:8080/`
- [ ] Test new route: `curl http://localhost:8080/admin/[new-route]`
- [ ] Verify in browser: Navigate to new pages

### 5. Common Issues & Solutions

#### Issue: 404 on New Routes
**Cause**: Next.js cache not cleared or server not restarted
**Solution**: 
```bash
rm -rf .next && npm run dev
```

#### Issue: TypeScript Errors Preventing Compilation
**Cause**: Type mismatches in new components
**Solution**: 
1. Run `npx tsc --noEmit --skipLibCheck`
2. Fix all TypeScript errors
3. Restart server

#### Issue: Server Not Responding (000 status)
**Cause**: Server crashed or still starting
**Solution**: 
1. Check process: `ps aux | grep "next dev"`
2. Kill and restart if needed
3. Wait for full compilation (can take 20-30 seconds)

### 6. Use the Restart Script
For convenience, use the restart script:
```bash
./restart-server.sh
```

## 🔧 Debugging Commands

```bash
# Check if server is running
ps aux | grep "next dev"

# Check server response
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/

# Check TypeScript compilation
npx tsc --noEmit --skipLibCheck

# Check Next.js build
npm run build

# Clear all caches
rm -rf .next node_modules/.cache
```

## 📝 Future Development Process

1. **Plan**: Write down what routes/files you'll create
2. **Create**: Add new files and components
3. **Check**: Run TypeScript check
4. **Restart**: Always restart server with cache clear
5. **Test**: Verify all routes work
6. **Document**: Update this checklist if needed

## ⚠️ Important Notes

- **Never assume** new routes work without testing
- **Always clear .next cache** when adding routes
- **Wait for full compilation** before testing
- **Check TypeScript errors first** before server restart
- **Use the restart script** for consistency
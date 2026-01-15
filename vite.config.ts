import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Read FRONTEND_HOST from environment variable
  const frontendHost = process.env.FRONTEND_HOST || 'prescool.appsolutions224.com';
  
  // Build array of allowed hosts
  const allowedHosts = ['localhost', '.appsolutions224.com'];
  
  // Add custom host if different from localhost
  if (frontendHost !== 'localhost') {
    allowedHosts.push(frontendHost);
  }

  return {
    server: {
      allowedHosts: allowedHosts,
    },
  };
});

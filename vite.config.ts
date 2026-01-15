import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Read FRONTEND_HOST from environment variable
  const frontendHost = process.env.FRONTEND_HOST || 'localhost';
  
  // Build array of allowed hosts
  const allowedHosts = ['localhost'];
  
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

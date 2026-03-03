#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧹 Environment History Cleanup Script');
console.log('This script will remove any .env files from Git history if they were accidentally committed.\n');

try {
  console.log('🔍 Checking Git history for .env files...');
  
  // Check if .env exists in Git history
  const gitLog = execSync('git log --name-only --pretty=format:"%h %s" -- .env', { encoding: 'utf8' });
  
  if (gitLog.stdout.trim()) {
    console.log('⚠️  Found .env files in Git history:');
    console.log(gitLog.stdout);
    
    console.log('🗑️  Removing .env files from Git history...');
    
    // Remove .env files from all branches
    execSync('git filter-branch --tree --remove .env', { encoding: 'utf8' });
    execSync('git filter-branch --tree --prune-empty', { encoding: 'utf8' });
    
    // Create a commit to clean the history
    execSync('git commit -m "🧹 Remove .env files from Git history - security cleanup"', { encoding: 'utf8' });
    
    console.log('✅ .env files removed from Git history');
    console.log('📝 Git history cleaned successfully');
    
  } else {
    console.log('✅ No .env files found in Git history');
    console.log('🎉 Good! No cleanup needed.');
  }
  
  console.log('\n🔐 Security Reminder:');
  console.log('.env files should NEVER be committed to version control!');
  console.log('They are properly excluded in .gitignore for your protection.\n');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Run: npm run setup-env (to create fresh .env from .env.example)');
  console.log('2. Edit: nano .env (with your actual values)');
  console.log('3. Never commit: git add .env or git commit .env files');
  
} catch (error) {
  console.error('❌ Error cleaning Git history:', error.message);
  process.exit(1);
}

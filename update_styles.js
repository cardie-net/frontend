const fs = require('fs');
const path = require('path');

const replacements = {
  'styles.container':
    '"min-h-[calc(100vh-42px)] flex items-center justify-center bg-background text-foreground p-8"',
  'styles.card':
    '"w-full max-w-md bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[4px_4px_0px_#5f4f4e] dark:shadow-[4px_4px_0px_#d4d4d4] rounded-lg p-8"',
  'styles.title': '"text-3xl font-extrabold mb-2 text-foreground"',
  'styles.subtitle': '"text-foreground/80 mb-6 font-medium"',
  'styles.error':
    '"bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-md mb-6 text-sm font-medium border border-red-200 dark:border-red-800"',
  'styles.success':
    '"bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-3 rounded-md mb-6 text-sm font-medium border border-green-200 dark:border-green-800"',
  'styles.formGroup': '"mb-4"',
  'styles.label': '"block text-sm font-bold mb-1.5 text-foreground"',
  'styles.input':
    '"w-full bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] rounded-md px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-shadow shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] font-medium"',
  'styles.button':
    '"w-full flex items-center justify-center gap-2.5 bg-[#7e6b69] dark:bg-white text-background transition-all rounded-md px-4 py-2.5 text-base font-bold border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[1px_1px_0px_#5f4f4e] dark:shadow-[1px_1px_0px_#d4d4d4] hover:-translate-y-px hover:shadow-[2px_2px_0px_#5f4f4e] dark:hover:shadow-[2px_2px_0px_#d4d4d4] active:translate-y-px active:shadow-none focus:outline-none mt-6 disabled:opacity-70 disabled:cursor-not-allowed"',
  'styles.linkText':
    '"mt-6 text-center text-sm font-medium text-foreground/80 flex gap-2 justify-center"',
  'styles.link': '"text-foreground hover:underline font-bold"',
  'styles.successCard':
    '"w-full max-w-md bg-background border border-[#5f4f4e] dark:border-[#d4d4d4] shadow-[4px_4px_0px_#5f4f4e] dark:shadow-[4px_4px_0px_#d4d4d4] rounded-lg p-8 text-center"',
  'styles.iconWrapper':
    '"w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"',
  'styles.successTitle': '"text-2xl font-bold text-foreground mb-4"',
  'styles.successText': '"text-foreground/80 mb-8 font-medium"',
};

const dirsToSearch = ['login', 'signup', 'forgot-password', 'reset-password', 'verify'];
const basePath = '/home/artiekra/Personal/cardie/frontend/src/app';

dirsToSearch.forEach((dir) => {
  const filePath = path.join(basePath, dir, 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove import styles from '../auth.module.css';
    content = content.replace(/import styles from '\.\.\/auth\.module\.css';\n?/g, '');

    // Replace {styles.something} with class strings
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      content = content.replace(regex, value);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${dir}/page.tsx`);
  }
});

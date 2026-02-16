#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const program = new Command();
const CONFIG_PATH = path.join(os.homedir(), '.debuglyrc');

// Helper to load config
function loadConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

// Helper to save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

// Helper to detect framework/language
function detectWorkspace() {
  const files = fs.readdirSync(process.cwd());
  const context = {
    framework: 'Generic',
    language: 'JavaScript',
    metaFiles: []
  };

  if (files.includes('next.config.js') || files.includes('next.config.mjs')) {
    context.framework = 'Next.js';
  } else if (files.includes('tailwind.config.js')) {
    context.framework = 'Tailwind CSS';
  } else if (files.includes('package.json')) {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    if (pkg.dependencies?.['react']) context.framework = 'React';
    if (pkg.dependencies?.['vue']) context.framework = 'Vue';
  }

  if (files.includes('tsconfig.json')) {
    context.language = 'TypeScript';
  }

  return context;
}

program
  .name('debugly')
  .description('Pipes errors from terminal to Debugly AI engine')
  .version('0.1.0');

program.command('auth')
  .description('Configure your API token')
  .argument('<token>', 'Your Secret API Token from Debugly Settings')
  .action((token) => {
    saveConfig({ token });
    console.log(chalk.green('✔') + ' API Token saved successfully.');
  });

program.command('analyze')
  .description('Analyze an error message or log')
  .argument('[error]', 'Error message to analyze (optional if piping)')
  .option('-m, --model <id>', 'AI model to use (llama-3.1-8b-instant | llama-3.3-70b-versatile)', 'llama-3.1-8b-instant')
  .action(async (error, options) => {
    let context = [];
    let errorInput = error || '';
    const workspace = detectWorkspace();

    // Handle piping
    if (!process.stdin.isTTY) {
      const stdinData = await new Promise((resolve) => {
        let data = '';
        process.stdin.on('data', chunk => data += chunk);
        process.stdin.on('end', () => resolve(data));
      });
      
      if (stdinData) {
        context.push({
          id: 'stdin',
          name: 'Terminal Output',
          content: stdinData,
          isMainError: true
        });
      }
    }

    if (!errorInput && context.length === 0) {
      console.error(chalk.red('Error:') + ' Please provide an error message or pipe logs to debugly.');
      process.exit(1);
    }

    const { token } = loadConfig();
    if (!token) {
      console.error(chalk.yellow('Login required:') + ' Run ' + chalk.cyan('debugly auth <your-token>') + ' first.');
      process.exit(1);
    }

    console.log(chalk.blue('Neural Scan:') + ` Detected ${chalk.bold(workspace.framework)} (${workspace.language})`);
    console.log(chalk.blue('Processing...') + ' Sending to Debugly Neural Engine (' + options.model + ')');

    const body = JSON.stringify({
      context,
      error: errorInput,
      modelId: options.model,
      detectedFramework: workspace.framework,
      detectedLanguage: workspace.language
    });

    const reqOptions = {
      hostname: 'localhost', // TODO: Change to production URL
      port: 3000,
      path: '/api/analyze',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': body.length
      }
    };

    const req = https.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data);
          console.log('\n' + chalk.bgGreen.black(' ANALYSIS COMPLETE ') + '\n');
          console.log(chalk.bold('Title: ') + result.title);
          console.log(chalk.bold('Severity: ') + result.severity);
          console.log('\n' + chalk.bold('What Broke:'));
          console.log(result.whatBroke);
          console.log('\n' + chalk.bold('The Fix:'));
          result.fixSteps.forEach(s => console.log(chalk.cyan(`• `) + s.text));
          
          if (result.analysisId) {
            console.log('\n' + chalk.dim('View Full Report: ') + chalk.underline(`http://localhost:3000/analysis/${result.analysisId}`));
          }
        } else {
          console.error(chalk.red('Failed: ') + data);
        }
      });
    });

    req.on('error', (e) => {
      console.error(chalk.red('Request Error: ') + e.message);
    });

    req.write(body);
    req.end();
  });

program.parse();

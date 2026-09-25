import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 timeout:45000,
 expect:{timeout:10000},
 retries:0,
 workers:1,
 use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure'},
 webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI,stdout:'ignore',stderr:'ignore'},
 reporter:[['list'],['html',{open:'never',outputFolder:'playwright-report'}]]
});

import {defineConfig} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',
 timeout:45000,
 expect:{timeout:10000},
 retries:1,
 workers:1,
 use:{baseURL:'https://raf-studio.pl',trace:'retain-on-failure'},
 reporter:[['list'],['html',{open:'never',outputFolder:'playwright-report'}]]
});

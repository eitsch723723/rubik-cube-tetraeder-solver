const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'.',timeout:45000,expect:{timeout:8000},workers:1,retries:0,
  use:{baseURL:'http://127.0.0.1:4173',ignoreHTTPSErrors:true},
  projects:[
    {name:'chromium',use:{browserName:'chromium',viewport:{width:402,height:874}}},
    {name:'webkit',use:{browserName:'webkit',viewport:{width:402,height:874}}}
  ]
});

const { default: got } = require("got/dist/source");
const fetch = require("node-fetch");
const cheerio = require('cheerio');
const { WaitTask } = require("puppeteer");

startTime = Date.now ();
function executingAt() {
    return (Date.now() - startTime) / 1000;
  }
  var userDetails1 = '' ;

  async function test(){
      console.log('start: ' + executingAt())
      try {
          userDetails1 = await ("https://api.github.com/users/zivtir" );
          // jsonRes = await userDetails1.json()
          // console.log('jsonRes')
      } catch (error) {
        console.log(error)          
      }
      console.log('end: ' + executingAt())
    // return jsonRes; 
  }

async function fetchAllUsersDetailsParallelyWithStats() {
  let singleUsersDetailsPromises = [];
    let promise = callUrl('https://www.ynet.co.il/home/0,7340,L-8,00.html');
    // let promise1 = callUrl('http://jsonviewer.stack.hu/');
    let promise1 = callUrl('https://github.com/request/request-promise/tree/{{ urlEncodedRefName }}');
    let promise2= callUrl('https://github.com/GoogleChrome/puppeteer');

    promise1.then(f=>  console.log('promise1'));

    console.log( "Created all Promises at " + executingAt())
    singleUsersDetailsPromises.push(promise);
    singleUsersDetailsPromises.push(promise1);
    singleUsersDetailsPromises.push(promise2);
  console.log("Finished adding all promises at " + executingAt());
  let allUsersDetails =  await (await Promise.all(singleUsersDetailsPromises));
  // let allUsersDetails =  await (await Promise.all(singleUsersDetailsPromises)).filter(url => url !== undefined);
  console.log("Got the results for all promises at " + executingAt());
  allUsersDetails.forEach(pro => {
    if (pro !== undefined) {
      
      const $ = cheerio.load(pro.body);
      console.log('==' +  $('title').text());
    }
  })
  console.log('end')
}

async function callUrl(url) {
  console.log("Starting API call for " + url + " at " + executingAt());
  try {
    var urlPromise = await  got(url);
    // console.log(urlPromise.statusCode)
    // console.log()
  } catch (error) {
    // console.log(error)
    return undefined;
  }
  console.log("get promise ,Finished API call for " + url + " at " + executingAt());
  return urlPromise;
}
// test()
fetchAllUsersDetailsParallelyWithStats();
console.log('end of interpretor ' + + executingAt())
const express = require('express');
var cors = require('cors')
const rp = require('request-promise');
const cheerio = require('cheerio');
const got = require('got');
const port = 8000;
let visited = new Map(); // holds all the visited urls
let maxDepth;
let maxPages;
const app = express();
app.use(cors())

app.listen(port, () => {
  console.log('Listening on port ' + port);
});


startTime = new Date().getTime();
function executingAt() {
    return (new Date().getTime() - startTime) / 1000;
  }

app.get('/scrape', async (req, res) => { 
    visited.clear();
    console.log('entry ')
    let scrapeurl = req.query.scrapeurl;
    maxDepth = req.query.depth;
    maxPages = req.query.maxpages;
    await extractLinks(scrapeurl); // return to the client only when all the results came
    console.log('done crawling... on server')
    let jsonObject = {};    
    for (let [key, value] of visited) {
      jsonObject[key] = value  ;
    }
    res.send(JSON.stringify(jsonObject))
});

// async method calling url return promise.
async function callUrl(url){
  console.log(executingAt() + ' before call ' + url)
  try {
    retUrl = await got(url);
  } catch (error) {
    return undefined;
  }
  console.log(executingAt() + ' after call ' + url)
  return retUrl;
}

const extractLinks = async (url) => {
  try {
      const queue = []; // using queue for BFS
      var countPage = 1;
      var nextDepth;
      
      visited.set(url,{title:'pagetitle',depth:0,page:countPage,pageLinks:[]})
      queue.push({url:url,depth:0});
      while (queue.length > 0 ) {
        let UrlPromises = [];
        nextDepth = iterateCallUrls(queue,UrlPromises);

        let urlResponses = await Promise.all(UrlPromises);
        console.log(executingAt() + ' All promises were returned of depth '.concat(nextDepth -1))
        urlResponses.forEach(urlResponse => {
          if (urlResponse !== undefined) {
            const $ = cheerio.load(urlResponse.body);
            var title = $('title').text();
            try {
              getVisited(urlResponse.url).title=title;
            } catch (error) {}
            
            const linkObjects = $('a');
            var links =[];
            linkObjects.each((index, element) => {
              var href = $(element).attr('href');
              if (typeof href === 'string' && href.includes('http')){
                links.push(href); // for result presentation
                if(countPage + 1 <= maxPages && nextDepth <= maxDepth && !visited.has(href)){
                  countPage++;
                  queue.push({url:href,depth:nextDepth}); 
                  visited.set(href,{title:'pagetitle',depth:nextDepth,page:countPage,pageLinks:[]})
                }
              }
            });
            try {
              getVisited(urlResponse.url).pageLinks=links;
            } catch (error) {}
          }
        });
        console.log(executingAt() + ' ===========> done break depth ' +  nextDepth)
    };
  } catch (error) {
    console.log('************\t' + error);
  }
};

// fetch each child url of a concreate page
function iterateCallUrls(queue,UrlPromises){
  do {
    var cururl = queue.shift();
    nextDepth = cururl.depth + 1;
    let promise = callUrl(cururl.url);
    UrlPromises.push(promise)
  } while (queue.length > 0);
  return nextDepth;
}
 
// return a visited url
function getVisited(url){
  if (visited.get(url) !== undefined) {
    return visited.get(url);
  }
  else
    return visited.get(url.slice(0, -1));
}




const express = require('express');
var cors = require('cors')
const rp = require('request-promise');
const cheerio = require('cheerio');
const got = require('got');
// var AsyncLock = require('async-lock');

// var lock = new AsyncLock();
const port = 8000;
let visited = new Map();
let maxDepth ;
let maxPages;
var countPage ;
const queue = [];
const app = express();
app.use(cors())
var countWaitingForResponse=0;

app.listen(port, () => {
  console.log('Listening on port ' + port);
});

var callUrl = async (callback, cururl) => {
  const response = await got(cururl.url);
  callback(response,cururl);
  console.log('after callback -->> '  +cururl.url)
}

var handleResponse = (response,cururl) => {
  var nextDepth = cururl.depth + 1;
  const html = response.body;
  const $ = cheerio.load(html);
  const linkObjects = $('a');
  var title = $('title').text();
  visited.get(cururl.url).title=title;
  console.log(cururl.url + ' XXXXXXXXXXXXXXXXXXXXXX' + title)
  countWaitingForResponse--;

  if(countPage <= maxPages && nextDepth <= maxDepth){
    linkObjects.each((index, element) => {
      var href = $(element).attr('href');
      if (typeof href === 'string' && href.includes('http')){
        
        if (!visited.has(href)) {
          if(++countPage > maxPages)
            return false;

          queue.push({url:href,depth:nextDepth}); 
          visited.set(href,{depth:nextDepth,page:countPage,title:'temptitle'})
        }
      }
    });
  }
}

app.get('/scrape', async (req, res) => { 
  let scrapeurl = req.query.scrapeurl;
  maxDepth = req.query.depth;
  maxPages = req.query.maxpages;
  await manageLinks(scrapeurl);
  let jsonObject = {};    
  for (let [key, value] of visited) {
    jsonObject[key] = value  ;
  }
  console.log(JSON.stringify(jsonObject))  
  res.send(JSON.stringify(jsonObject))
});

const manageLinks = async (url) => {
  try {
      countPage = 1;
      visited.set(url,{depth:0,page:countPage,title:'temptitle'})
      queue.push({url:url,depth:0});
      var firstcall = true;
      var loops =1;
      while (queue.length > 0 && (countWaitingForResponse > 0 || firstcall)) {
        console.log(loops++)
        firstcall = false;
        var cururl = queue.shift();
        if (cururl != undefined) {
          countWaitingForResponse++;
          callUrl(handleResponse,cururl);
          console.log('after callUrl -->> ' + cururl.url)
        }
    };
  } catch (error) {
    console.log(error.response.body);
  }
};

const extractLinks = async (url) => {
  try {
      const queue = [];
      var countPage = 1;
      visited.set(url,{depth:0,page:countPage,title:'temptitle'})
      queue.push({url:url,depth:0});

      while (queue.length > 0 ) {
        var cururl = queue.shift();
        var nextDepth = cururl.depth + 1;
        const response = await got(cururl.url);
        
        const html = response.body;
        
        const $ = cheerio.load(html);
        const linkObjects = $('a');

        var title = $('title').text();
        visited.get(cururl.url).title=title;

        if(countPage <= maxPages && nextDepth <= maxDepth){
          linkObjects.each((index, element) => {
            var href = $(element).attr('href');
            if (typeof href === 'string' && href.includes('http')){
              
              if (!visited.has(href)) {
                if(++countPage > maxPages)
                  return false;
                queue.push({url:href,depth:nextDepth}); 
                visited.set(href,{depth:nextDepth,page:countPage,title:'temptitle'})
              }
            }
          });
        }
    };
  } catch (error) {
    console.log(error.response.body);
  }
};




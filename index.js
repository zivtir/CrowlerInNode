const express = require('express');
var cors = require('cors')
const rp = require('request-promise');
const cheerio = require('cheerio');
const got = require('got');
const { response } = require('express');
const port = 8000;
let visited = new Map();
let maxDepth;
let maxPages;
const app = express();
app.use(cors())

app.listen(port, () => {
  console.log('Listening on port ' + port);
});


startTime = Date.now ();
function executingAt() {
    return (Date.now() - startTime) / 1000;
  }

app.get('/scrape', async (req, res) => { 
    visited.clear();
    console.log('entry ')
    let scrapeurl = req.query.scrapeurl;
    maxDepth = req.query.depth;
    maxPages = req.query.maxpages;
    await extractLinks(scrapeurl);
    console.log('done crawling... on server')
    let jsonObject = {};    
    for (let [key, value] of visited) {
      jsonObject[key] = value  ;
    }
    res.send(JSON.stringify(jsonObject))
});

async function callUrl(url){
  console.log('before call ' + url)
  try {
    retUrl = await got(url);
  } catch (error) {
    return undefined;
  }
  console.log('after call ' + url)
  return retUrl;
}

const extractLinks = async (url) => {
  try {
      const queue = [];
      var countPage = 1;
      var nextDepth;
      visited.set(url,{depth:0,page:countPage,title:'temptitle'})
      queue.push({url:url,depth:0});
      while (queue.length > 0 ) {
        let UrlPromises = [];
        nextDepth = cururl.depth + 1;
        do {
          var cururl = queue.shift();
          let promise = callUrl(cururl.url);
          UrlPromises.push(promise)
        } while (queue.length > 0);

        let urlResponses = await Promise.all(UrlPromises);
        urlResponses.forEach(urlResponse => {
          if (urlResponse !== undefined) {
            const $ = cheerio.load(urlResponse.body);
            var title = $('title').text();
            try {
              if (visited.get(urlResponse.url) !== undefined) {
                visited.get(urlResponse.url).title=title;
              }
              else{
                visited.get(urlResponse.url.slice(0, -1)).title=title;
              }
            } catch (error) {}
            
            if(countPage <= maxPages && nextDepth <= maxDepth){
              const linkObjects = $('a');
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
        });
    };
  } catch (error) {
    console.log('*******000*****\n' + error);
  }
};




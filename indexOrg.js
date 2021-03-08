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

app.get('/scrape', async (req, res) => { 
    visited.clear();
    let scrapeurl = req.query.scrapeurl;
    maxDepth = req.query.depth;
    maxPages = req.query.maxpages;
    await extractLinks(scrapeurl);
    let jsonObject = {};    
    for (let [key, value] of visited) {
      jsonObject[key] = value  ;
    }
    // console.log(JSON.stringify(jsonObject))  
    res.send(JSON.stringify(jsonObject))
});

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
        var title = $('title').text();
        visited.get(cururl.url).title=title;
        
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
    };
  } catch (error) {
    console.log('************\n' + error.response.body);
  }
};




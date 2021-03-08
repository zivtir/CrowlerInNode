  clientRequest();
  console.log('end flow')

var pendingResponse=0;
var maxDepth =0;

function clientRequest(){
  maxDepth = 0;
  pendingResponse++;
  callurl('url1',0);
  callurl('url2');
}

function callurl(url,currentDepth){
  console.log(url)
  setTimeout(() => {
    mycallback(url,currentDepth);
  },1000);
}


function mycallback(url,currentDepth){
  console.log('callback- ' + str);
}

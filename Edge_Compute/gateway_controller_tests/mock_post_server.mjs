import http from 'http';

var server = http.createServer(function(request, response) {
if (request.method == 'POST') {
        var body = '';
        request.on('data', function (data) {
            body += data;
        });
        request.on('end', function () {
            try {
              var post = JSON.parse(body);
              // deal_with_post_data(request,post);
              console.log(post); // <--- here I just output the parsed JSON
              response.writeHead(200, {"Content-Type": "text/plain"});
              response.end();
              return;
            }catch (err){
              response.writeHead(500, {"Content-Type": "text/plain"});
              response.write("Bad Post Data.  Is your data a proper JSON?\n");
              response.end();
              return;
            }
        });
    }
});
server.listen(4000);
console.log("server started")
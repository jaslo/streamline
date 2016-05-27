# streamline
Promise based line reader, takes a stream

to use

open readable stream and supply to constructor
  
  //obtain a readable stream: 
  readstrm = getreadstream(...)
  
  var sl = new streamLine(readstrm, optional delimeter string!);
  
  while (!done) {
    sl.readLine().
    then(function(line) { 
      if (!line) done = true;
      else {
        ...
        <process line>
        ...
    });
  }
  

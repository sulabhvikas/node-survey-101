var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'CenturyLink India Survey Tool',
  description: 'The nodejs.org example web server.',
  script: require('path').join(__dirname,'app.js')
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();
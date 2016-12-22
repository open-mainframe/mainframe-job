"use strict";

const jsftp = require('jsftp');
const os = require('os');

class JobEntrySubsystem {
  constructor(server, username, password, configfile) {
    this.server = server;
    this.username = username;
    this.password = password;
    this.newline = (os.platform() === 'win32') ? '\r\n' : 'n';
    // if (configfile) this.loadConfig(configfile);
    this.configLoaded = (server && username && password);
    // if (configLoaded) this.connect();
  }
  _enter() {
    return this;
  }
  _exit() {
    this.closeConnection();
  }
  connect() {
    let hostname, port;
    const connectObj = {};
    if (!this.server || !this.username || !this.password) {
      throw "Cannot connect: Credentials are missing";
    }
    connectObj.user = this.username;
    connectObj.pass = this.password;

    // Parse the server string for : and treat string after that as port number
    const serverArray = this.server.split(':');
    connectObj.host = serverArray[0];

    if (serverArray.length > 1) {
      connectObj.port = serverArray[1];
    }
    // Connect
    this.ftpSession = new jsftp(connectObj);
    // this.ftpSession.raw["SITE FILETYPE=jes"](()=>{}) // Alternate index if zOS doesn't like below
    this.ftpSession.raw('SITE FILETYPE=jes', (err, data) => {
      if (err) return console.error(err);
      console.log(data.text); // Show the FTP response text to the user
      console.log(data.code); // Show the FTP response code to the user
      this.connected = true;
    });
  }
  disconnect(){
    this.ftpSession.raw.quit(function(err, data) {
    if (err) return console.error(err);
    console.log("Bye!");
});
  }
  submitJob(){}
  retrieveJob(){}
  deleteJob(){}
  processJobOutput(){}
  processJob(){}
  loadConfig(){}
  createConfig(){}
  closeConnection(){}
}

module.exports = JobEntrySubsystem;
# Node Login

[![node-login](./readme_includes/node-login.jpg?raw=true)](https://nodejs-login.herokuapp.com)

### A basic account management system built in Node.js with the following features:

* New User Account Creation
* Secure Password Reset via Email
* Ability to Update / Delete Account
* Session Tracking for Logged-In Users
* Local Cookie Storage for Returning Users
* Blowfish-based Scheme Password Encryption

## Live Demo

[https://nodejs-login.herokuapp.com](https://nodejs-login.herokuapp.com)

For testing purposes you can view a [database dump of all accounts here](https://nodejs-login.herokuapp.com/print).<br>Note: This database automatically resets every 24 hours.

## Installation & Setup

1. Install [Node.js](https://nodejs.org/) & [MongoDB](https://www.mongodb.org/) if you haven't already.

2. Clone this repository and install its dependencies.

		> git clone git://github.com/braitsch/node-login.git node-login
		> cd node-login
		> npm install

3. In a separate shell start MongoDB.

		> mongod

4. From within the node-login directory start the server.

		> node app

5. Open a browser window and navigate to: [http://localhost:3000](http://localhost:3000)

## Password Retrieval

To enable the password retrieval feature it is recommended that you create environment variables for your credentials instead of hard coding them into the [email dispatcher module](https://github.com/braitsch/node-login/blob/master/app/server/modules/email-dispatcher.js).

To do this on OSX you can simply add them to your `.profile` or `.bashrc` file.

	export NL_EMAIL_HOST='smtp.gmail.com'
	export NL_EMAIL_USER='your.email@gmail.com'
	export NL_EMAIL_PASS='1234'

[![node-login](./readme_includes/retrieve-password.jpg?raw=true)](https://nodejs-login.herokuapp.com)

## Command line usage

[![cli.svg](https://brettz9.github.io/node-login/readme_includes/cli.svg)](cli.svg)

To view as non-embedded HTML or SVG files (for copy-pasteable commands):

- [cli.html](https://brettz9.github.io/node-login/readme_includes/cli.html)
- [cli.svg](https://brettz9.github.io/node-login/readme_includes/cli.svg)

## Programmatic usage

- TODO

## Steps for getting port that may block Mongo DB

MongoDB may end up with a process that interferes with starting a new instance.

On the Mac, you can follow these steps to resolve:

1. Get the port `sudo lsof -i :27017`
2. Then kill by `kill PID` with PID as the result of step 1 (or if necessary `kill -9 PID`).

## Contributing

Questions and suggestions for improvement are welcome.

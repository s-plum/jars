#jars
> Web app for behavioral economics experiment

##Installation

1. Clone the repository into the root of the location where the project will live. This can be either your local machine or an AWS instance.

2. Run `npm install` in the command line from your root folder to set up all project dependencies.

3. Start up the database by running `redis-server` from your root folder.

4. Once the database is up and running, run `node postserver` from your root folder to get the app going. 
	- If you are working locally, you should be able to browse to localhost:8080 to view the experiment in action.
	- If running from an AWS instance, you may have to change configurations on both the instance and within the postserver.js file to make sure that the application is running from the correct port.

const functionsio = require("../");

functionsio.config.filterAuthenticationEnabled = true;
functionsio.config.filterAuthorizationEnabled = true;

functionsio.start();
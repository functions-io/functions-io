module.exports.login = function(message, callBack){
    try {
        //{"grant_type":"password","username": "user@example.com","password": "pwd","audience": "https://someapi.com/api", "scope": "read:sample", "client_id": "YOUR_CLIENT_ID", "client_secret": "YOUR_CLIENT_SECRET"}
        let responseObj = {};
        let tokenObj = {};

        tokenObj.access_token = "MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3";
        tokenObj.token_type = "bearer";
        tokenObj.expires_in = 3600;
        tokenObj.refresh_token = "IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk";
        tokenObj.scope = message.scope;

        responseObj.body = JSON.stringify(tokenObj);
        responseObj.statusCode = 200;

        callBack(null, responseObj);
    }
    catch (errTry) {
        let responseObj = {};
        let errObj = {};
        
        errObj.error = "Server error";
        errObj.error_description = errTry.message;
        //errObj.error_uri = "";
        
        responseObj.body = JSON.stringify(errObj);
        responseObj.statusCode = 500;

        callBack(null, responseObj);
    }
};
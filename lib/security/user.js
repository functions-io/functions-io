//{"grant_type":"password","username": "user@example.com","password": "pwd","audience": "https://someapi.com/api", "scope": "read:sample", "client_id": "YOUR_CLIENT_ID", "client_secret": "YOUR_CLIENT_SECRET"}

module.exports.login = function(username, password, context, callBack){
    try {
        let userObj = {};
        userObj.name = username;
        userObj.sub = username; //id
        callBack(null, userObj);
    }
    catch (errTry) {
        let errObj = {};
        
        errObj.code = 0;
        errObj.message = errTry.message;
        errObj.data = errObj;

        callBack(errObj);
    }
};
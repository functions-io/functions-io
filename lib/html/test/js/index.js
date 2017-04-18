(function(){
    var $btnCatalogRefresh;
    var contRequest = 0;
    var tableCatalog = null;

    function ajaxGET(url, callBack){
        ajax("GET", null, url, callBack);
    }

    function ajaxSET(data, url, callBack){
        ajax("POST", data, url, callBack);
    }

    function ajax(method, data, url, callBack){
        var xhr = new XMLHttpRequest();
        var resp;

        xhr.onerror = function(){
            callBack("Server Not Responding", null);
        };

        xhr.onload = function(){
            if (this.status === 200){
                resp = JSON.parse(this.responseText || null);
                callBack(null, resp);
            }
            else{
                callBack(this.status, null);
            }
        };

        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
    }

    function init(){
        $btnCatalogRefresh = document.getElementById("btnCatalogRefresh");
        
        $btnCatalogRefresh.onclick = handleBtnCatalogRefres_Click; 

        tableCatalog = new Table("tblCatalog");
        tableCatalog.handleClick = catalogitemClick; 
        
        consultCatalog();
    }

    function consultCatalog(){
        tableCatalog.clear();
        ajaxGET("http://localhost:8080/sys.unitTest", function(err, data){
            if (err){
                console.error(err);
            }
            else{
                var list = [];
                var itemFunction;
                var itemTest;
                for (var i = 0; i < data.result.listResult.length; i++){
                    itemFunction = data.result.listResult[i];
                    for (var i2 = 0; i2 < itemFunction.listResult.length; i2++){
                        itemTest = itemFunction.listResult[i2];
                        list.push({name: itemFunction.name, success: itemTest.success, time: itemTest.time, description: itemTest.description, error: itemTest.error}) 
                    }
                }
                //console.log("resposta");
                //console.log(data);
                drawTable_catalog(list);
            }
        });
    }

    function drawTable_catalog(data){
        tableCatalog.draw(data);
    }

    function catalogitemClick(index, item){
        console.log("click in item");
        console.log(item);
    }
    
    function handleBtnCatalogRefres_Click(){
        consultCatalog();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
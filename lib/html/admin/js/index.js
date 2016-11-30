(function(){
    var listFunctions = null;
    var $tblCatalog_tbody;
    var $btnCatalogRefresh;
    var itemSelected = null;
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
        ajaxGET("sys.stats", function(err, data){
            if (err){
                console.error(err);
            }
            else{
                //console.log("resposta");
                //console.log(data);
                listFunctions = data.result;
                drawTable_catalog(listFunctions);
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
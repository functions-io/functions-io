(function(){
    var listFunctions = null;
    var $tblCatalog_tbody;
    var $btnCatalogRefresh;
    var itemSelected = null;
    var contRequest = 0;

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
        $tblCatalog_tbody = document.getElementById("tblCatalog_tbody");
        $btnCatalogRefresh = document.getElementById("btnCatalogRefresh");
        
        $tblCatalog_tbody.onclick = handleTbody_Click;
        $btnCatalogRefresh.onclick = handleBtnCatalogRefres_Click; 

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
        var item;
        var $tr, $td;
        
        $tblCatalog_tbody.innerHTML = "";
        itemSelected = null;
        for (var i = 0; i < data.length; i++){
            item = data[i];

            $tr = document.createElement("tr");
            $tr.tag = i;
            
            $td = document.createElement("td");
            $td.innerHTML = item.name;
            $tr.appendChild($td);

            $td = document.createElement("td");
            $td.innerHTML = item.version || "";
            $tr.appendChild($td);

            $td = document.createElement("td");
            $td.innerHTML = item.category || "";
            $tr.appendChild($td);

            $td = document.createElement("td");
            $td.innerHTML = item.hits.success;
            $tr.appendChild($td);

            $td = document.createElement("td");
            $td.innerHTML = item.hits.error;
            $tr.appendChild($td);

            $td = document.createElement("td");
            $td.innerHTML = item.hits.abort;
            $tr.appendChild($td);

            $td = document.createElement("td");
            $td.innerHTML = Math.round(item.hits.avgResponseTime);
            $tr.appendChild($td);

            $td = document.createElement("td");
            $td.innerHTML = Math.round(item.hits.minResponseTime);
            $tr.appendChild($td);

            $td = document.createElement("td");
            $td.innerHTML = Math.round(item.hits.maxResponseTime);
            $tr.appendChild($td);

            $tblCatalog_tbody.appendChild($tr);
        }
    }

    function handleTbody_Click(e){
        if (e.target.parentElement.nodeName === "TR"){
            var index = e.target.parentElement.tag;
            var item;
            
            if (e.target.parentElement.className){
                e.target.parentElement.className = "";
            }
            else{
                var $listElements = $tblCatalog_tbody.getElementsByClassName("rowSelected");
                if ($listElements.length > 0) $listElements[0].className = "";
                e.target.parentElement.className = "rowSelected";

                item = listFunctions[index];
                catalogitemClick(item);
            }
        }
    }

    function catalogitemClick(item){
        console.log("click in item");
        console.log(item);
    }
    
    function handleBtnCatalogRefres_Click(){
        consultCatalog();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
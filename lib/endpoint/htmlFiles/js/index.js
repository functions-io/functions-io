(function(){
    var listFunctions = null;
    var $tblCatalog_tbody;
    var $code_catalog_input, $code_catalog_output;
    var $spnCatalog_description;
    var $btnRunTest;
    var $dialog_container;
    var $btn_dialog_container_run;
    var $btn_dialog_container_cancel;
    var $txtDialog_container_message;
    var $txtDialog_container_response;
    var $lbl_dialog_container_title;
    var $txtDialog_container_curl;
    var $txtDialog_container_get;
    var $cmbDialog_container_lastmessages;
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
        $code_catalog_input = document.getElementById("code_catalog_input");
        $code_catalog_output = document.getElementById("code_catalog_output");
        $spnCatalog_description = document.getElementById("spnCatalog_description");
        $btnRunTest = document.getElementById("btnRunTest");
        $dialog_container = document.getElementById("dialog_container");
        $btn_dialog_container_run = document.getElementById("btn_dialog_container_run");
        $btn_dialog_container_cancel = document.getElementById("btn_dialog_container_cancel");
        $txtDialog_container_message = document.getElementById("txtDialog_container_message");
        $txtDialog_container_response = document.getElementById("txtDialog_container_response");
        $lbl_dialog_container_title = document.getElementById("lbl_dialog_container_title");
        $txtDialog_container_curl = document.getElementById("txtDialog_container_curl");
        $txtDialog_container_get = document.getElementById("txtDialog_container_get");
        $cmbDialog_container_lastmessages = document.getElementById("cmbDialog_container_lastmessages");
        $btnCatalogRefresh = document.getElementById("btnCatalogRefresh");
        
        $txtDialog_container_message.onchange = function(){txtRenderExample();};
         
        $tblCatalog_tbody.onclick = handleTbody_Click;
        $btnRunTest.onclick = handleBtnRunTest_Click;
        $btn_dialog_container_run.onclick = handleBtn_dialog_container_run_Click;
        $btn_dialog_container_cancel.onclick = handleBtn_dialog_container_cancel_Click;
        $cmbDialog_container_lastmessages.onchange = handleCmbDialog_container_lastmessages_Change;
        $btnCatalogRefresh.onclick = handleBtnCatalogRefres_Click; 

        consultCatalog();
    }

    function consultCatalog(){
        cleanDetail();
        ajaxGET("sys.catalog", function(err, data){
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
            $td.innerHTML = item.info.category || "";
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

    function drawDetail(item){
        itemSelected = item;

        $spnCatalog_description.innerHTML = item.info.description;
        $code_catalog_input.innerHTML = "\n" + JSON.stringify(item.input, null, 2);
        $code_catalog_output.innerHTML = "\n" + JSON.stringify(item.output, null, 2);
    }

    function cleanDetail(){
        $spnCatalog_description.innerHTML = "";
        $code_catalog_input.innerHTML = "";
        $code_catalog_output.innerHTML = "";
    }

    function parseInputDefinition(input, space){
        var message = {};
        var listKeys;

        if (!(space)){
            space = 2;
        }

        listKeys = Object.keys(input);
        for (var i = 0; i < listKeys.length; i++){
            if (input[listKeys[i]].type === "number"){
                message[listKeys[i]] = 0;
            }
            else if (input[listKeys[i]].type === "date"){
                message[listKeys[i]] = new Date().toJSON().split("T")[0];
            }
            else if (input[listKeys[i]].type === "datetime"){
                message[listKeys[i]] = new Date().toJSON();
            }
            else{
                message[listKeys[i]] = "";
            }
        } 
        return JSON.stringify(message,null,space);
    }

    function txtRenderExample(){
        var text;
        var messageObject = null;
        var messageObjectKeys = null;

        messageObject = JSON.parse($txtDialog_container_message.value);

        if (messageObject){
            text = "curl -H 'Content-Type:application/json' -XPOST " + location.origin + "/" + itemSelected.name + "/" + itemSelected.version + " -d '" + JSON.stringify(messageObject) + "'";
            $txtDialog_container_curl.value = text;

            text = location.origin + "/" + itemSelected.name + "/" + itemSelected.version + "?";
            messageObjectKeys = Object.keys(messageObject);
            for (var i = 0; i < messageObjectKeys.length; i++){
                if (i > 0){
                    text += "&";
                }
                text += messageObjectKeys[i] + "=" + messageObject[messageObjectKeys[i]];
            }
            $txtDialog_container_get.value = text;
        }
        else{
            $txtDialog_container_curl.value = "";
            $txtDialog_container_get.value = "";
        }
    }

    function cmbRenderLastMessages(){
        var url;
        var $itemOption;
        url = itemSelected.name + "/" + itemSelected.version;
        var listLastMessage = JSON.parse(window.localStorage.getItem("test-" + url));
        if (listLastMessage === null){
            listLastMessage = [];
        }

        $cmbDialog_container_lastmessages.innerHTML = "";
        $itemOption = document.createElement("option");
        $itemOption.text = "";
        $cmbDialog_container_lastmessages.appendChild($itemOption);
        for (var i=0; i<listLastMessage.length; i++){
            $itemOption = document.createElement("option");
            $itemOption.text = listLastMessage[i];
            $itemOption.value = i;
            $cmbDialog_container_lastmessages.appendChild($itemOption);
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
                drawDetail(item);
            }
        }
    }

    function handleBtnRunTest_Click(){
        if (itemSelected){
            $lbl_dialog_container_title.innerHTML = itemSelected.name + " - " + itemSelected.version;
            $txtDialog_container_message.value = parseInputDefinition(itemSelected.input, 0);
            txtRenderExample();
            
            $txtDialog_container_response.value = "";
            cmbRenderLastMessages();
            $dialog_container.setAttribute("aria-hidden", "false");
            $txtDialog_container_message.focus();
        }
        else {
            alert("Item not selected");
        }
    }

    function handleBtn_dialog_container_run_Click(){
        var messageText;
        var url;
        url = itemSelected.name + "/" + itemSelected.version;
        contRequest ++;
        //messageText = "{\"jsonrpc\": \"2.0\", \"method\": \"" + itemSelected.name + "\", \"params\": " + $txtDialog_container_message.value + ", \"id\": " + contRequest + ", \"version\": \"" + itemSelected.version + "\"}";
        messageText = $txtDialog_container_message.value;
        ajaxSET(messageText, url, function(err, data){
            if (err){
                alert(err);
            }
            else{
                $txtDialog_container_response.value = JSON.stringify(data, null, 2);

                if (window.localStorage){
                    var listLastMessage = JSON.parse(window.localStorage.getItem("test-" + url));
                    if (listLastMessage === null){
                        listLastMessage = [];
                    }
                    listLastMessage.unshift(messageText);
                    if (listLastMessage.length > 5){
                        listLastMessage.pop();
                    }
                    window.localStorage.setItem("test-" + url, JSON.stringify(listLastMessage));
                    cmbRenderLastMessages();
                }
            }
        });
    }

    function handleBtn_dialog_container_cancel_Click(){
        $dialog_container.setAttribute("aria-hidden", "true");
        consultCatalog();
    }

    function handleCmbDialog_container_lastmessages_Change(){
        var index;
        index = $cmbDialog_container_lastmessages.selectedIndex;
        if (index > 0){
            $txtDialog_container_message.value = $cmbDialog_container_lastmessages.options[index].innerHTML;
        }
        else{
            $txtDialog_container_message.value = parseInputDefinition(itemSelected.input, 0);
        }
        txtRenderExample();
    }

    function handleBtnCatalogRefres_Click(){
        consultCatalog();
    }

    document.addEventListener("DOMContentLoaded", init);
})();
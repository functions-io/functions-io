var Table = function(par1){
    this.$tbl = null;
    this.$tbl_body = null;
    this.$tbl_thead = null;
    this.$tbl_thead_tr = null;
    this.columns = null;
    this.indexSelected = -1;
    this.data = null;

    var self = this;

    if (typeof(par1) === "string"){
        this.$tbl = document.getElementById(par1);
    }
    if (typeof(par1) === "object"){
        this.$tbl = par1;
    }

    this.$tbl_body = this.$tbl.getElementsByTagName("tbody")[0];
    if (this.$tbl_body === undefined){
        this.$tbl_body = document.createElement("tbody");
        this.$tbl.appendChild(this.$tbl_body);
    }

    this.$tbl_thead = this.$tbl.getElementsByTagName("thead")[0];
    if (this.$tbl_thead){
        this.$tbl_thead_tr = this.$tbl_thead.getElementsByTagName("tr")[0];
        if ((this.$tbl_thead_tr) && (this.columns === null)){
            this.columns = [];
            var $thArray = this.$tbl_thead_tr.getElementsByTagName("th");
            for (var i = 0; i < $thArray.length; i++){
                if ($thArray[i].getAttribute("data-attr")){
                    this.columns.push({name: $thArray[i].getAttribute("data-attr"), format: $thArray[i].getAttribute("data-format")});
                }
            }
        }
    }

    this.$tbl_body.onclick = handleTbody_Click;

    function createRow(data){
        var item;
        var $tr, $td;
        var value;
        var keyArray;
        
        $tr = document.createElement("tr");

        for (var i = 0; i < self.columns.length; i++){
            item = self.columns[i];
    
            $td = document.createElement("td");
            keyArray = item.name.split(".");
            if (keyArray.length === 1){
                value = data[keyArray[0]];
            }
            else if (keyArray.length === 2){
                value = data[keyArray[0]][keyArray[1]];
            }
            else if (keyArray.length === 3){
                value = data[keyArray[0]][keyArray[1]][keyArray[2]];
            }
            else if (keyArray.length === 4){
                value = data[keyArray[0]][keyArray[1]][keyArray[2]][keyArray[3]];
            }
            else if (keyArray.length === 5){
                value = data[keyArray[0]][keyArray[1]][keyArray[2]][keyArray[3]][keyArray[4]];
            }
            else if (keyArray.length === 6){
                value = data[keyArray[0]][keyArray[1]][keyArray[2]][keyArray[3]][keyArray[4]][keyArray[5]];
            }
            if (value === undefined){
                value = "";
            }
            if (item.format){
                if (typeof(item.format) === "function"){
                    value = item.format(value);
                }
                else{
                    if (item.format === "round"){
                        value = Math.round(value);
                    }
                }
            }
            $td.innerHTML = value;
            $tr.appendChild($td);
        }

        return $tr;
    }

    function handleTbody_Click(e){
        if (e.target.parentElement.nodeName === "TR"){
            var index = e.target.parentElement.tag;
            var item;
            
            if (e.target.parentElement.className){
                e.target.parentElement.className = "";
            }
            else{
                var $listElements = self.$tbl_body.getElementsByClassName("rowSelected");
                if ($listElements.length > 0) $listElements[0].className = "";
                e.target.parentElement.className = "rowSelected";

                self.indexSelected = index;
                if (self.handleClick){
                    self.handleClick(index, self.data[index]);
                }
            }
        }
    }

    this.draw = function(data){
        var item;
        var $tr;
        
        this.indexSelected = -1;
        this.$tbl_body.innerHTML = "";
        this.data = data;
        
        for (var i = 0; i < data.length; i++){
            item = data[i];

            $tr = createRow(item);
            $tr.tag = i;
            this.$tbl_body.appendChild($tr);
        }
    };

    this.getSelected = function(){
        if (this.indexSelected === -1){
            return null;
        }
        else{
            if (this.data){
                return this.data[this.indexSelected];
            }
            else{
                return null;
            }
        }
    }    
};
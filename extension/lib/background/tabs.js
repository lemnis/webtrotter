var storedTabsArr = [];
class tabs {
    static store(tab){
        storedTabsArr.push(tab);
    }
    static get(func){
        return storedTabsArr.filter(func)[0];
    }
    static getPreviousByID(id){
        var previousUrl = storedTabsArr.filter(storedTab => id == storedTab.tabId);
        if(previousUrl.length == 0){ // none found
            return false;
        } else {
            // get the last added a.k.a. the previous visited url
            return previousUrl[previousUrl.length -1];
        }
    }
}

module.exports = tabs;

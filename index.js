/* global Vue */

function getDatabase() {
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            console.log(this.readyState);
            if (this.readyState == 4 && this.status == 200) {
                resolve( JSON.parse(this.responseText) );
            }
            else if (this.readyState == 4 && this.status != 200) {
                reject(this.status);
            }
        };
        
        xhttp.open("GET", "./database.json", true);
        xhttp.send();
    });
}

var app = new Vue({
    el: '#app',
    data: {
        database: null,
        selectedVariables: [],
        selectedVariables: {},
        title: 'Hello Vue!'
    },
    created: function() {
        var self = this;
        getDatabase().then( function(db) {
            console.log("DB Fetched");
            self.database = db;
        }).catch( function(err) {
            console.error(err);
        })
    }
})

/* global Vue */
/* global _ */

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
        title: 'Hello Vue!'
    },
    computed: {
        variablesChunked: function() {
            return _.chunk(Object.keys(this.database.variables), 2)
        },
        variablesFullTitles: function() {
            let fullTitles = {}
            for(let variable in this.database.variables) {
                fullTitles[variable] = variable + ":" + this.database.variables[variable];
            }
            
            return fullTitles;
            
        }
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

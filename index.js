/* global Vue */
/* global _ */
/* global katex */

var POINTS_PER_VAR = 2;
var POINTS_PER_TAG = 1;

function scrollToTop() {
    window.scroll(0,0);
}

function firstUpper(value) {
    return value.charAt(0).toUpperCase() + value.substr(1);
}

function getDatabase() {
    return new Promise(function(resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            console.log(this.readyState);
            if (this.readyState == 4 && this.status == 200) {
                resolve(JSON.parse(this.responseText));
            }
            else if (this.readyState == 4 && this.status != 200) {
                reject(this.status);
            }
        };

        xhttp.open("GET", "./database.json", true);
        xhttp.send();
    });
}

Vue.component('math-equation', {
    props: ['markup'],
    template: '<div ref="renderer"></div>',
    mounted: function() {
        katex.render(this.markup, this.$refs.renderer);
    }
})

var app = new Vue({
    el: '#app',
    data: {
        database: null,
        selectedVariables: [],
        negativelySelectedVars: [],
        selectedTags: [],
        title: 'Hello Vue!',
        results: null
    },
    computed: {
        variablesChunked: function() {
            return _.chunk(Object.keys(this.database.variables), 2)
        },
        variablesFullTitles: function() {
            var fullTitles = {}
            for (var variable in this.database.variables) {
                fullTitles[variable] = '"' + variable + '" : ' + firstUpper(this.database.variables[variable]);
            }

            return fullTitles;

        },
        tags: function() {
            return _.uniq(
                _.flatMap(Object.values(this.database.equations), function(equationDetails) {
                    return equationDetails.tags;
                })
            )
        },
        tagsChuncked: function() {
            return _.chunk(this.tags, 2)
        }
    },
    methods: {
        calculateAndSetResults: function() {

            var equationsAndScores = []

            for (var equation in this.database.equations) {
                var equationsDetails = this.database.equations[equation];

                var num_tags = _.intersection(equationsDetails.tags, this.selectedTags).length;
                var num_vars = _.intersection(equationsDetails.vars, this.selectedVariables).length;
                var num_negs = _.intersection(equationsDetails.vars, this.negativelySelectedVars).length;
                
                var tot_points = POINTS_PER_TAG * equationsDetails.tags.length + POINTS_PER_VAR * equationsDetails.vars.length;
                var points = POINTS_PER_TAG * num_tags + POINTS_PER_VAR * (num_vars - num_negs);
                points /= tot_points;

                equationsAndScores.push({
                    equation: equation,
                    points: points
                });
            }

            var filteredEquationsAndScores = equationsAndScores.filter(function(es) {
                return es.points > 0;
            })
            
            var sortedEquationsAndScores = _.sortBy(filteredEquationsAndScores, ['points']);
            _.reverse(sortedEquationsAndScores);
            
            console.log(sortedEquationsAndScores);
            
            this.results = sortedEquationsAndScores.map( function(es) {
                return es.equation;
            })
            
            scrollToTop();
        },
        returnToEdit: function() {
            this.results = null;
            scrollToTop();
        }
    },
    created: function() {
        var self = this;
        getDatabase().then(function(db) {
            console.log("DB Fetched");
            self.database = db;
        }).catch(function(err) {
            console.error(err);
        })
    }
})

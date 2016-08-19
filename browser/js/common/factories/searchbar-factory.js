app.factory('Search', function ($state, $rootScope) {
    var PATH = 'search';
    var database = firebase.database();
    var searchParams = {};

    function sendSearchQuery (params) {
        searchParams = params;
        var terms = makeTerm(searchParams);
        if (terms === '*') return
        doSearch(terms);
    }

    function doSearch(query) {
        var index = 'firebase';
        var ref = database.ref().child(PATH);
        var type = 'snippet';
        var key = ref.child('request').push({ index: index, type: type, query: query }).key;
        ref.child('response/' + key).on('value', sendResults);
    }

    function sendResults(snap) {
        if (!snap.exists()) {
            return;// wait until we get data
        }
        var data = snap.val();
        var result = { 'data': data };
        if (data.hits) $state.go('search', { 'result': result });
    }

    function makeTerm(params) {
        console.log($rootScope.user.organization);
        var keys = Object.keys(params);
        var searching = ['organization:' + $rootScope.user.organization];
        var term;
        for (var key in params) {
            term = params[key]
            if (!term.match(/^\*/)) { term = '*' + term; }
            if (!term.match(/\*$/)) { term += '*'; }
            var queryStr = (key !== 'query') ? ('' + key + ':' + term) : (term)

            searching.push(queryStr);
        }
        return searching.join(' AND ');
    }

    return {
        sendSearchQuery: sendSearchQuery,
        doSearch: doSearch,
        sendResults: sendResults,
        makeTerm: makeTerm
    }
})

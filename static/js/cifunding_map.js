L.mapbox.accessToken = 'pk.eyJ1IjoibWF4d2VsbDg4ODgiLCJhIjoiY2pqcHJpbnF6MDhzMDN3cDRubGJuMzBsayJ9.bA38eIQYmV3OMpwgeeb2Dg';
var map = L.mapbox.map('map', 'mapbox.light')
    .setView([53, -4], 6);

// Choropleth colors from http://colorbrewer2.org/
// You can choose your own range (or different number of colors)
// and the code will compensate.
var hues = [
    '#eff3ff',
    '#bdd7e7',
    '#6baed6',
    '#3182bd',
    '#08519c'];

// The names of variables that we'll show in the UI for
// styling. These need to match exactly.
var variables = [
    'B06011002 - Born in state of residence',
    'B06011003 - Born in other state of the United States',
    'B06011004 - Native; born outside the United States'];

// Collect the range of each variable over the full set, so
// we know what to color the brightest or darkest.
var ranges = {};
var $select = $('<select></select>')
    .appendTo($('#variables'))
    .on('change', function () {
        setVariable($(this).val());
    });
for (var i = 0; i < variables.length; i++) {
    ranges[variables[i]] = { min: Infinity, max: -Infinity };
    // Simultaneously, build the UI for selecting different
    // ranges
    $('<option></option>')
        .text(variables[i])
        .attr('value', variables[i])
        .appendTo($select);
}

// Create a layer of state features, and when it's done
// loading, run loadData
var usLayer = L.mapbox.featureLayer()
    .loadURL('/static/data/Travel_to_Work_Areas_2011.geojson')
    .addTo(map)
    .on('ready', loadData);

// Grab the spreadsheet of data as JSON. If you have CSV
// data, you should convert it to JSON with
// http://shancarter.github.io/mr-data-converter/
function loadData() {
    $.getJSON('/static/data/censusdata.json')
        .done(function (data) {
            joinData(data, usLayer);
        });
}

function joinData(data, layer) {
    // First, get the US state GeoJSON data for reference.

    // get geojson
    var usGeoJSON = usLayer.getGeoJSON(),
        byState = {};

    // Rearrange it so that instead of being a big array,
    // it's an object that is indexed by the state name,
    // that we'll use to join on.

    // bystate is geojson but with each feature named
    for (var i = 0; i < usGeoJSON.features.length; i++) {
        byState[usGeoJSON.features[i].properties.name] =
            usGeoJSON.features[i];
    }

    // add data for each state to properties, replacing the GeoJSON feature properties with the full data.
    for (i = 0; i < data.length; i++) {
        byState[data[i].name].properties = data[i];

        // for each measure, add min and max of data to ranges obj
        for (var j = 0; j < variables.length; j++) {
            var n = variables[j];
            ranges[n].min = Math.min(data[i][n], ranges[n].min);
            ranges[n].max = Math.max(data[i][n], ranges[n].max);
        }
    }
    // Create a new GeoJSON array of features and set it
    // as the new usLayer content.

    // convert bystate obj to an array
    var newFeatures = [];
    for (i in byState) {
        newFeatures.push(byState[i]);
    }

    // set newfeatures as new uslayer content
    usLayer.setGeoJSON(newFeatures);

    // pick the first measure to be displayed
    setVariable(variables[0]);
}

// color the map.
function setVariable(name) {
    var scale = ranges[name];
    console.log(scale);

    usLayer.eachLayer(function (layer) {
        // Decide the color for each state by finding its
        // place between min & max, and choosing a particular
        // color as index.
        var division = Math.floor(
            (hues.length - 1) *
            ((layer.feature.properties[name] - scale.min) /
                (scale.max - scale.min)));
        // See full path options at
        // http://leafletjs.com/reference.html#path
        layer.setStyle({
            fillColor: hues[division],
            fillOpacity: 0.8,
            weight: 0.5
        });

        var maxslegend = '';
        for (var i = 0; i < hues.length; i++) {
            var val = '';
            if (i==0) {
                val = scale['min']
            }
            if (i==hues.length - 1) {
                val = scale['max']
            }

            maxslegend +=

                '<div style="dispay: inline"><div style="background:' + hues[i] + '; height: 30px; width: 60px;">' + val + '</div>' + '<div>' + '' + '</div></div>';
        }
        console.log(maxslegend);
        map.legendControl.addLegend(maxslegend);
    });
}
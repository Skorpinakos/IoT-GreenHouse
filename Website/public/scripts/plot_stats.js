let id = document.getElementById("plant_id").textContent.split(' ')[2];
fetch('http://localhost:4000/get_plant_stats?ID='+id).then(response => response.json()).then(response => {
    console.log(response);
    let sizes = [];
    let leaf_densities = [];
    let measurement_datetimes = [];
    for( let m of response) {
      sizes.push(m.SIZE);
      leaf_densities.push(m.LEAF_DENSITY);
      measurement_datetimes.push(m.MEASUREMENT_DATE + ' ' + m.MEASUREMENT_TIME);
    } 
    console.log(sizes, leaf_densities, measurement_datetimes);
    let trace_of_size = {x:measurement_datetimes, y:sizes, name: 'Size (cm)',  mode: 'lines+markers', type: 'scatter'};
    let trace_of_leaf_density = {x:measurement_datetimes, y:leaf_densities, name: 'Leaf density (%)', mode: 'lines+markers', type: 'scatter'};
    let data = [trace_of_size, trace_of_leaf_density];

    // Define Layout
    var layout = {
      xaxis: {title: "Date and time"},
      title: "Size and Leaf density over time"
    };
    
    // Display using Plotly
    Plotly.newPlot("stat_plot", data, layout);
});




let cells =  document.getElementsByTagName('td');
let scripts = document.getElementsByTagName('script');
let script = scripts[scripts.length-1];
let rows = script.getAttribute('rows');
let columns = script.getAttribute('columns');
let n = rows * columns;
for (let i = cells.length - n; i < cells.length; i++){
    let plant_health = "";
    if(cells[i].innerHTML.includes('>')){
        plant_health = (Number(cells[i].innerHTML.split('>')[1].split('%')[0])/100).toFixed(2);
    }
    else{
        plant_health = (Number(cells[i].innerHTML.split('%')[0])/100).toFixed(2);
    }
    let red = (255*(1-plant_health)).toFixed(2);
    let green = (255*plant_health).toFixed(2);
    let bgColor = "rgba(" + String(red) + "," + String(green) + ", 0, 0.5)";
    if (cells[i].className != 'current_plant'){
        cells[i].style.backgroundColor = bgColor;
    }
    else{
        cells[i].style.backgroundColor = "rgba(0, 161, 228, 0.5)";

    }
}  
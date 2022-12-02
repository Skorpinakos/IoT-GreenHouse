import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import { Console } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db_name = path.join(__dirname, "../data", "Our_App.db");

const getPlantRecents = (n, callback) => {

    let sql="SELECT DISTINCT GREENHOUSE_ID, PM.ID as PM_ID,P.ID AS P_ID, TYPE, MEASUREMENT_DATE, MEASUREMENT_TIME, HEALTH, MEASUREMENT_PHOTO FROM (PLANT AS P JOIN (SELECT * FROM PLANT_MEASUREMENT) AS PM on P.ID = PLANT_ID) JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT ?";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [n], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const getGreenhouseRecents = (n, callback) => {

    let sql="SELECT DISTINCT GREENHOUSE_ID, GM.ID, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, SUNLIGHT, HUMIDITY, SOIL_PH,CO2, GREENHOUSE_PHOTO FROM (GREENHOUSE AS G JOIN (SELECT * FROM GREENHOUSE_MEASUREMENT) AS GM on G.ID = GREENHOUSE_ID) ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT ?";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [n], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const get_plant_info = (id, callback) => {

    let sql='SELECT GREENHOUSE_ID, PM.ID AS PM_ID, P.ID AS P_ID, TYPE, MEASUREMENT_DATE, MEASUREMENT_TIME, HEALTH, SIZE, GROWTH, ROW, COLUMN, MEASUREMENT_PHOTO  FROM (PLANT_MEASUREMENT AS PM  JOIN PLANT AS P ON PLANT_ID = P.ID) WHERE PLANT_ID=?  ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT 2';
    const db = new sqlite3.Database(db_name);
    db.all(sql,[id], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const get_greenhouse_info = (id, callback) => {

    let sql='SELECT GREENHOUSE_ID, GM.ID AS GM_ID, MEASUREMENT_DATE, MEASUREMENT_TIME, ROWS, COLUMNS, TEMPERATURE, SUNLIGHT, HUMIDITY, SOIL_PH,CO2, GREENHOUSE_PHOTO FROM (GREENHOUSE AS G JOIN  GREENHOUSE_MEASUREMENT AS GM on G.ID = GREENHOUSE_ID) WHERE G.ID = ? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT 1';
    const db = new sqlite3.Database(db_name);
    db.all(sql, [id], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const getAll = (callback) => {

    let sql='SELECT t.id,t.title,t.image_path,t.state,t.creation_date,l.building FROM Ticket t LEFT JOIN Location l ON t.locale = l.id ORDER BY t.Creation_date DESC';
    const db = new sqlite3.Database(db_name);
    db.all(sql, [], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const get_report_from_key = (key, callback) => {

    let sql='SELECT t.id,t.title,t.image_path,t.state,t.creation_date,l.building,t.description,t.closure_date,t.locale,l.coordinates_x,l.coordinates_y,t.contact_phone,t.contact_email,t.category FROM (Ticket t LEFT JOIN Contract c ON c.damage=t.id) tc LEFT JOIN Location l ON tc.locale=l.id WHERE tc.key = ?';
    const db = new sqlite3.Database(db_name);
    db.all(sql, [key], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const get_update_query = (entity, info) =>{
    let keys = Object.keys(info);
    let attributes = '';

    for (let i = 0; i < keys.length; i++) {
        attributes += String(keys[i] + ' = ?')
        if( i < keys.length - 1){
            attributes += ', ';
      }}
    
    let sql = "UPDATE " + entity + " SET " + attributes + " WHERE id = ?";
    return sql
}
const update_report = (failure_id, locale_id, ticket_info, locale_info, callback) =>{
    
    let ticket_sql=get_update_query('Ticket', ticket_info);
    let ticket_values = Object.values(ticket_info).concat(failure_id);

    let locale_sql=get_update_query('Location', locale_info);
    let locale_values = Object.values(locale_info).concat(locale_id);

    const db = new sqlite3.Database(db_name); 
    db.run(ticket_sql, ticket_values, (err) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    } // επιστρέφει array
    if(locale_values.length > 1){
        db.run(locale_sql, locale_values, (err) => {
            if (err) {
                db.close();
                callback(err, null);
                console.log(err);
            }
        });
    }
    db.close();
    callback(null);

    });

}

const get_search_results = (n,search_text, callback) => {
    let condition_string="t.title like ? OR t.description like ? OR t.id like ? OR l.building like ? AND t.state != 'Κλειστή'"//.replaceAll('$',search_text);
    let value = "%"+String(search_text)+"%";
    let sql="SELECT t.state,t.creation_date,t.id,t.title,t.image_path,t.description,l.building FROM Ticket t LEFT JOIN Location l ON t.locale = l.id WHERE "+condition_string+" ORDER BY t.Creation_date DESC LIMIT ?"
    const db = new sqlite3.Database(db_name);
    db.all(sql, [value,value,value,value,n], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const get_open_failures_coords = (n, callback) => {

    let sql="SELECT t.id,l.coordinates_x,l.coordinates_y,t.state FROM Ticket t LEFT JOIN Location l ON t.locale = l.id WHERE t.state != 'Κλειστή' ORDER BY t.Creation_date DESC LIMIT ?";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [n], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}


const push_failure_in_db = (info,callback) => {

    let sql="INSERT INTO Ticket (id,title,description,creation_date,closure_date,state,image_path,ip,contact_phone,contact_email,locale,category) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [info['id'],info['title'],info['description'],info['creation_date'],info['closure_date'],info['state'],info['image_path'],info['ip'],info['contact_phone'],info['contact_email'],info['locale'],info['category']], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const push_location_in_db = (info,callback) => {

    let sql="INSERT INTO Location (id,building,coordinates_x,coordinates_y) VALUES (?,?,?,?)";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [info['id'],info['building'],info['coordinates_x'],info['coordinates_y']], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const find_biggest_failure_id = (callback) => {

    let sql="SELECT id FROM Ticket ORDER BY id DESC LIMIT 1";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const find_biggest_location_id = (callback) => {

    let sql="SELECT id FROM Location ORDER BY id DESC LIMIT 1";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const delete_report = (id,callback) => {

    const db = new sqlite3.Database(db_name);
    let sql="DELETE FROM Ticket WHERE id = ?";
    db.run(sql, [id], (err, rows) => {
    if (err) {
        db.close();
        console.log(err);
        callback(err, null)
        db.close();
        return;
    }
    getAll((err,rows)=>{
        callback(null, rows)
    });

    });
}

export {getPlantRecents,getGreenhouseRecents,get_search_results,get_open_failures_coords,find_biggest_failure_id,find_biggest_location_id,push_failure_in_db,push_location_in_db,get_plant_info,get_greenhouse_info, get_report_from_key,getAll,delete_report,update_report};


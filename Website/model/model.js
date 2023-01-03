import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import { Console } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db_name = path.join(__dirname, "../data", "Our_App.db");

const getPlantRecents = (n, id, callback) => {

    let sql="SELECT DISTINCT GREENHOUSE_ID, PM.ID as PM_ID, P.ID AS P_ID, ROW, COLUMN, TYPE, IP, MEASUREMENT_DATE, MEASUREMENT_TIME, HEALTH, MEASUREMENT_PHOTO FROM (PLANT AS P JOIN (SELECT * FROM PLANT_MEASUREMENT) AS PM on P.ID = PLANT_ID) JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID WHERE CLIENT_ID = ? GROUP BY GREENHOUSE_ID ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT ?";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [id, n], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const getGreenhouseRecents = (n,id, callback) => {

    let sql="SELECT DISTINCT GREENHOUSE_ID, GM.ID, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, SUNLIGHT, HUMIDITY,CO2, GREENHOUSE_PHOTO FROM (GREENHOUSE AS G JOIN (SELECT * FROM GREENHOUSE_MEASUREMENT) AS GM on G.ID = GREENHOUSE_ID) WHERE CLIENT_ID = ? GROUP BY GREENHOUSE_ID ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT ?";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [id, n], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const getPlantInfo = (id, callback) => {

    let sql='SELECT GREENHOUSE_ID, P.ID, IP, TYPE, LIFESPAN, ROW, COLUMN FROM (PLANT AS P JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID) WHERE P.ID = ?';
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

const getPlantMeasurementInfo = (id, callback) => {

    let sql='SELECT ID, MEASUREMENT_DATE, MEASUREMENT_TIME, LEAF_DENSITY, HEALTH, SIZE, GROWTH, MEASUREMENT_PHOTO FROM PLANT_MEASUREMENT WHERE PLANT_ID=? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT 1';
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

const getGreenhouseInfo = (id, callback) => {

    let sql='SELECT ID, IP, CLIENT_ID, ROWS, COLUMNS, HEIGHT, LENGTH, WIDTH, COORDS_X, COORDS_Y, GREENHOUSE_PHOTO FROM GREENHOUSE WHERE ID = ?';
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

const getGreenhouseMeasurementInfo = (id, callback) => {

    let sql='SELECT ID, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, SUNLIGHT, HUMIDITY, CO2 FROM GREENHOUSE_MEASUREMENT WHERE GREENHOUSE_ID = ? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT 1';
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

const getGreenhousePlants = (id, callback) => {

    let sql='SELECT P.ID, ROWS, COLUMNS FROM (PLANT AS P JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID) WHERE GREENHOUSE_ID = ? ORDER BY ROW ASC, COLUMN ASC;';
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

const getClientGreenhouseMeasurements = (id, callback) => {

    let sql='SELECT DISTINCT GREENHOUSE_ID, GREENHOUSE_PHOTO, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, HUMIDITY FROM GREENHOUSE_MEASUREMENT AS GM JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID WHERE CLIENT_ID = ? GROUP BY GREENHOUSE_ID ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC;';
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

const getClientGreenhouses = (id, callback) => {

    let sql='SELECT ID, GREENHOUSE_PHOTO FROM GREENHOUSE WHERE CLIENT_ID = ?;';
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

const getUpdateQuery = (entity, info) =>{
    let attributes = '';

    for (let i = 0; i < info.length; i++) {
        attributes += String(info[i] + ' = ?')
        if( i < info.length - 1){
            attributes += ', ';
      }}
    
    let sql = "UPDATE " + entity + " SET " + attributes + " WHERE id = ?";
    return sql
}

const storePlantMeasurement = (info,callback) => {

    let sql="INSERT INTO PLANT_MEASUREMENT (ID, PLANT_ID, MEASUREMENT_DATE, MEASUREMENT_TIME, SIZE, GROWTH, HEALTH, LEAF_DENSITY, MEASUREMENT_PHOTO) VALUES (?,?,?,?,?,?,?,?,?)";
    const db = new sqlite3.Database(db_name);
    db.all(sql, info, (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null); // επιστρέφει array
    });
}

const storeGreenhouseMeasurement = (info,callback) => {

    let sql="INSERT INTO GREENHOUSE_MEASUREMENT (ID, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, SUNLIGHT, HUMIDITY, CO2, GREENHOUSE_ID) VALUES (?,?,?,?,?,?,?,?)";
    const db = new sqlite3.Database(db_name);
    db.all(sql, info, (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null); // επιστρέφει array
    });
}

const getLastPlantMeasurementId = (callback) => {

    let sql="SELECT ID FROM PLANT_MEASUREMENT ORDER BY ID DESC LIMIT 1";
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

const getFirstGreenhousePlantId = (greenhouse_id, callback) => {

    let sql="SELECT P.ID FROM (PLANT AS P JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID) WHERE G.ID = ? ORDER BY P.ID ASC LIMIT 1";
    console.log(greenhouse_id)
    const db = new sqlite3.Database(db_name);
    db.all(sql, [greenhouse_id], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

const getLastGreenhouseMeasurementId = (callback) => {

    let sql="SELECT ID FROM GREENHOUSE_MEASUREMENT ORDER BY ID DESC LIMIT 1";
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

const updateMeasurementPhoto = (id, attributes, update_values) =>{
    
    let sql=getUpdateQuery('PLANT_MEASUREMENT', attributes);
    let values = Object.values(update_values).concat(id);
    const db = new sqlite3.Database(db_name); 
        db.run(sql, values, (err) => {
        if (err) {
            db.close();
            console.log(err);
        } // επιστρέφει array
        db.close();
    });
}

export {getFirstGreenhousePlantId, storePlantMeasurement, storeGreenhouseMeasurement, getLastGreenhouseMeasurementId, getLastPlantMeasurementId, getPlantRecents, updateMeasurementPhoto, getClientGreenhouses, getClientGreenhouseMeasurements, getGreenhouseMeasurementInfo,getGreenhouseRecents, getGreenhousePlants, getPlantMeasurementInfo, getPlantInfo,getGreenhouseInfo};


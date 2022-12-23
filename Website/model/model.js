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

    let sql="SELECT DISTINCT GREENHOUSE_ID, GM.ID, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, SUNLIGHT, HUMIDITY,CO2, GREENHOUSE_PHOTO FROM (GREENHOUSE AS G JOIN (SELECT * FROM GREENHOUSE_MEASUREMENT) AS GM on G.ID = GREENHOUSE_ID) ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT ?";
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

const getPlantInfo = (id, callback) => {

    let sql='SELECT GREENHOUSE_ID, ID, TYPE, LIFESPAN, ROW, COLUMN FROM PLANT WHERE ID=?';
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

    let sql='SELECT ID, MEASUREMENT_DATE, MEASUREMENT_TIME, LEAF_DENSITY, HEALTH, SIZE, GROWTH, MEASUREMENT_PHOTO FROM PLANT_MEASUREMENT WHERE PLANT_ID=? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME ASC LIMIT 2';
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

export {getPlantRecents, getClientGreenhouses, getClientGreenhouseMeasurements, getGreenhouseMeasurementInfo,getGreenhouseRecents, getGreenhousePlants, getPlantMeasurementInfo, getPlantInfo,getGreenhouseInfo};


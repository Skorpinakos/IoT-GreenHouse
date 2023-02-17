import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from 'url';
import bcrypt, { compareSync } from 'bcrypt'
import { open } from 'sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db_name = path.join(__dirname, "../data", "Our_App.db");

export const getPlantRecents = (n, id, callback) => {

    let sql="SELECT GREENHOUSE_ID, PM.ID as PM_ID, P.ID AS P_ID, ROW, COLUMN, TYPE, IP, MEASUREMENT_DATE, MEASUREMENT_TIME, HEALTH, MEASUREMENT_PHOTO FROM (PLANT AS P JOIN PLANT_MEASUREMENT AS PM on P.ID = PLANT_ID) JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID WHERE CLIENT_ID = ? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME DESC LIMIT ?";
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

export const getGreenhouseRecents = (n,id, callback) => {

    let sql="SELECT DISTINCT GREENHOUSE_ID, GM.ID, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, SUNLIGHT, HUMIDITY,CO2, GREENHOUSE_PHOTO FROM (GREENHOUSE AS G JOIN GREENHOUSE_MEASUREMENT AS GM on G.ID = GREENHOUSE_ID) WHERE CLIENT_ID = ? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME DESC LIMIT ?";
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

export const getPlantInfo = (id, callback) => {

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

export const getPlantMeasurementInfo = (id, callback) => {

    let sql='SELECT ID, MEASUREMENT_DATE, MEASUREMENT_TIME, LEAF_DENSITY, HEALTH, SIZE, GROWTH, MEASUREMENT_PHOTO FROM PLANT_MEASUREMENT WHERE PLANT_ID=? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME DESC LIMIT 2';
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

export const getPlantMeasurementStats = (id, callback) => {

    let sql='SELECT MEASUREMENT_DATE, MEASUREMENT_TIME, LEAF_DENSITY, SIZE FROM PLANT_MEASUREMENT WHERE PLANT_ID=? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME DESC';
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

export const getClientEmail = (id, callback) => {

    let sql='SELECT DISTINCT EMAIL FROM CLIENT AS C JOIN GREENHOUSE AS G on C.ID = G.CLIENT_ID WHERE G.ID = ?';
    const db = new sqlite3.Database(db_name);
    db.all(sql,[id], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    }
    db.close();
    callback(null, rows[0]); // επιστρέφει array
    });
}

export const getAllPlantMeasurementInfo = (id, callback) => {

    let sql='SELECT ID, MEASUREMENT_DATE, MEASUREMENT_TIME, LEAF_DENSITY, HEALTH, SIZE, GROWTH, MEASUREMENT_PHOTO FROM PLANT_MEASUREMENT WHERE PLANT_ID=? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME DESC';
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

export const getGreenhouseInfo = (id, callback) => {

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

export const getGreenhouseMeasurementInfo = (id, callback) => {

    let sql='SELECT ID, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, SUNLIGHT, HUMIDITY, CO2 FROM GREENHOUSE_MEASUREMENT WHERE GREENHOUSE_ID = ? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME DESC LIMIT 1';
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

export const getGreenhousePlantsWithInfo = (id, callback) => {

    let sql='SELECT P.ID, ROWS, COLUMNS, ROW, COLUMN, HEALTH, SIZE FROM (PLANT AS P JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID) JOIN PLANT_MEASUREMENT ON P.ID = PLANT_ID  WHERE GREENHOUSE_ID = ? GROUP BY P. ID ORDER BY ROW ASC, COLUMN ASC, MEASUREMENT_DATE DESC, MEASUREMENT_TIME DESC;';
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

export const getGreenhousePlantsWithoutInfo = (id, callback) => {

    let sql='SELECT P.ID, ROWS, COLUMNS FROM PLANT AS P JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID WHERE GREENHOUSE_ID = ? ORDER BY ROW ASC, COLUMN ASC;';
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

export const getClientGreenhouseMeasurements = (id, callback) => {

    let sql='SELECT DISTINCT GREENHOUSE_ID, GREENHOUSE_PHOTO, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, HUMIDITY FROM GREENHOUSE_MEASUREMENT AS GM JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID WHERE CLIENT_ID = ? GROUP BY GREENHOUSE_ID ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME DESC;';
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

export const getClientGreenhouses = (id, callback) => {

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
    
    let sql = "UPDATE " + entity + " SET " + attributes + " WHERE ID = ?";
    return sql
}

export const storePlantMeasurement =  (i, last_measurement_id, first_greenhouse_plant, measurement_start_datetime, plant_measurement_delay, size, ld, health) => {
    let sql1='SELECT ID, MEASUREMENT_DATE, MEASUREMENT_TIME, LEAF_DENSITY, HEALTH, SIZE, GROWTH, MEASUREMENT_PHOTO FROM PLANT_MEASUREMENT WHERE PLANT_ID=? ORDER BY MEASUREMENT_DATE DESC, MEASUREMENT_TIME DESC LIMIT 2';
    let plant_id = first_greenhouse_plant[0].ID + i;
    open({
        filename: db_name,
        driver: sqlite3.Database
      }).then(async (db) => {
        let measurement_rows = await db.all(sql1,[plant_id]);
        let plant_measurement = [];
        let id = last_measurement_id + i + 1;
        let growth = 0;
        let measurement_datetime = new Date(measurement_start_datetime.getTime() + (plant_measurement_delay *  1000))
        let measurement_date = measurement_datetime.toLocaleDateString().split('/').reverse();
        let measurement_time = measurement_datetime.toLocaleTimeString().split(' ')[0].split(':');
        for (let i = 0; i < 3; i++){
            if(measurement_time[i].length==1){ 
            measurement_time[i] = '0' + measurement_time[i];
            }
            if(measurement_date[i].length==1){
            measurement_date[i] = '0' + measurement_date[i];
            }
        }
        measurement_date = measurement_date.join('-');
        measurement_time = measurement_time.join(':');

        if(measurement_rows.length){
            growth = (size - measurement_rows[0].SIZE).toFixed(2);
        }
        const max_leaf_density = 3000;
        let leaf_density = (ld / max_leaf_density).toFixed(2);

        plant_measurement.push(id, plant_id, measurement_date, measurement_time, size, growth, health, leaf_density, 'null');
        
        let sql2="INSERT INTO PLANT_MEASUREMENT (ID, PLANT_ID, MEASUREMENT_DATE, MEASUREMENT_TIME, SIZE, GROWTH, HEALTH, LEAF_DENSITY, MEASUREMENT_PHOTO) VALUES (?,?,?,?,?,?,?,?,?)";
        let result = await db.run(sql2, plant_measurement);
        // console.log(result)
        db.close();
    })
    
}

export const storeGreenhouseMeasurement = (info,callback) => {

    let sql="INSERT INTO GREENHOUSE_MEASUREMENT (ID, MEASUREMENT_DATE, MEASUREMENT_TIME, TEMPERATURE, SUNLIGHT, HUMIDITY, CO2, GREENHOUSE_ID) VALUES (?,?,?,?,?,?,?,?)";
    const db = new sqlite3.Database(db_name);
    db.all(sql, info, (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err, rows);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

export const getLastPlantMeasurementId = (callback) => {

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

export const getFirstGreenhousePlantId = (greenhouse_id, callback) => {

    let sql="SELECT P.ID, G.ROWS, G.COLUMNS FROM (PLANT AS P JOIN GREENHOUSE AS G ON GREENHOUSE_ID = G.ID) WHERE G.ID = ? ORDER BY P.ID ASC LIMIT 1";
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

export const getLastGreenhouseMeasurementId = (callback) => {

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

export const getLastClienttId = (callback) => {

    let sql="SELECT ID FROM CLIENT ORDER BY ID DESC LIMIT 1";
    const db = new sqlite3.Database(db_name);
    db.all(sql, [], (err, rows) => {
    if (err) {
        db.close();
        callback(err+'1', null);
        console.log(err);
    }
    db.close();
    callback(null, rows); // επιστρέφει array
    });
}

export const updateMeasurementPhoto = (id, attributes, update_values) =>{
    
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

export let getClientByUsername = (username, callback) => {
    let sql = "SELECT ID, PASSWORD FROM CLIENT WHERE USERNAME = ? LIMIT 0, 1";
    const db = new sqlite3.Database(db_name); 
    db.all(sql, [String(username)], (err, rows) => {
    if (err) {
        db.close();
        callback(err, null);
        console.log(err);
    } // επιστρέφει array
    db.close();
    callback(null, rows[0]); // επιστρέφει array
    });
}


//Η συνάρτηση δημιουργεί έναν νέο χρήστη με password
export let registerClient = function (username, password, callback) {
    // ελέγχουμε αν υπάρχει χρήστης με αυτό το username
    getClientByUsername(username, async (err, user) => {
        getLastClienttId(async (err, lastClient) => {
            if (user != undefined) {
                callback(null, null, { message: "User already exists." })
            } 
            else {
                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const id = lastClient[0].ID + 1;
                    const sql = 'INSERT INTO CLIENT (ID, USERNAME, PASSWORD) VALUES (?, ?, ?)';
                    const db = new sqlite3.Database(db_name); 
                    db.run(sql, [id, username, hashedPassword], (err) => {
                    if (err) {
                        db.close();
                        callback(err, null, null);
                        console.log(err);
                    } // επιστρέφει array
                    db.close();
                    callback(null, null, { message: "Registration succeeded."}); // επιστρέφει array
                    });

                } catch (error) {
                    callback(error, null, { message: "Registration failed."});
                }
            }

        });
    });
}

/** 
 * Οι συναρτήσεις του controller που χρειάζονται για την αυθεντικοποίηση 
*/
import bcrypt from 'bcrypt'
import e from 'express';
import * as model from '../model/model.js';

export let showLogInForm = function (req, res) {
    res.render('login',{layout : 'layout'});
}

export let showRegisterForm = function (req, res) {
    res.render('register', {layout : 'layout'});
}

export let doRegister = function (req, res) {
    model.registerClient(req.body.username, req.body.password, (err, result, message) => {
        console.log(message)
        if (err) {
            console.error('registration error: ' + err);
            res.render('register', {layout : 'layout', message: message.message });
        }
        else if (message) {
            res.render('register',{layout : 'layout', message: message.message})
        }
        else {
            res.redirect('/login');
        }
    })
}

export let doLogin = function (req, res) {
    //Ελέγχει αν το username και το password είναι σωστά και εκτελεί την
    //συνάρτηση επιστροφής authenticated

    model.getClientByUsername(req.body.username, (err, client) => {

        if(client != undefined){
            console.log(client)
            const match = bcrypt.compare(req.body.password, client.PASSWORD, (err, match) => {
                if (match) {
                    //Θέτουμε τη μεταβλητή συνεδρίας "loggedUserId"
                    req.session.loggedUserId = client.ID;
                    //Αν έχει τιμή η μεταβλητή req.session.originalUrl, αλλιώς όρισέ τη σε "/" 
                    const redirectTo = req.session.originalUrl || "/recents";
                    // res.redirect("/");
                    res.redirect(redirectTo);
                }
                else {
                    res.render("login", {layout : 'layout', message: 'Incorrect username or password.'})
                }
            })
        }
        else{
            console.log('User not found')
            res.render("login", {layout : 'layout', message: 'Incorrect username or password.'})

        }
        })
        
    //})
}

export let doLogout = (req, res) => {
    //Σημειώνουμε πως ο χρήστης δεν είναι πια συνδεδεμένος
    req.session.destroy();
    res.redirect('/');
}

//Τη χρησιμοποιούμε για να ανακατευθύνουμε στη σελίδα /login όλα τα αιτήματα από μη συνδεδεμένους χρήστες
export let checkAuthenticated = function (req, res, next) {
    //Αν η μεταβλητή συνεδρίας έχει τεθεί, τότε ο χρήστης είναι συνεδεμένος
    if (req.session.loggedUserId) {
        console.log("user is authenticated", req.originalUrl);
        //Καλεί τον επόμενο χειριστή (handler) του αιτήματος
        next();
    }
    else {
        //Ο χρήστης δεν έχει ταυτοποιηθεί, αν απλά ζητάει το /login ή το register δίνουμε τον
        //έλεγχο στο επόμενο middleware που έχει οριστεί στον router
        if ((req.originalUrl === "/login") || (req.originalUrl === "/register")) {
            next()
        }
        else {
            //Στείλε το χρήστη στη "/login" 
            console.log("not authenticated, redirecting to /login")
            res.redirect('/login');
        }
    }
}


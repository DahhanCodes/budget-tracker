//creating an indexDB connection and declaring version 1 for our db
const connect = indexedDB.open('budget-tracker', 1)
//global var
var db;

//in the event of a succesful connection with the db, or a version upgrade occurs
//we need to store a refrence to db in global var
connect.onsuccess = function establish(event) {
    db = event.target.result
    if (navigator.onLine) {
        saveTrans()
    }
};

//will upgrade version if db version changes
connect.onupgradeneeded = function upgrade(event) {
    //storing a refrence to db
    //this is a local variable ("loacalDB"), even though it is serving a similar purpose as
    //the db var in the establish function
    // the difference is that it is not accessible except inside this function
    var loacalDB = event.target.result;
    loacalDB.creatObjectStore('budget-tracker', { autoIncrement: true })
};

//reporting an error if the db connection is not established
connect.onerror = function errorReport(event) {
    //reporting error
    console.log(event.target.result)
}

///////////////////////////////////////
////////functions section/////////////
//////////////////////////////////////

//save transaction
function saveTrans() {
    //specify a transaction
    var selectTrans = db.selectTrans(['budget-tracker'], 'readwrite');
    //getting object store
    var transObj = selectTrans.objectStore('budget-tracker');
    var getAll = transObj.getAll()
    //on success send indexDB's data to api
    getAll.onsuccess = function () {
        if (getAll.result.legnth > 0) {
            $.post('/api/transaction/bulk', {
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse)
                    }
                    //start a new transaction
                    var transaction = db.transaction(['budget-tracker'], 'readwrite')
                    var transObj = transaction.objectStore('budget-tracker');
                    transObj.clear()
                    alert("All transaction are successfully saved")
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
    }
}

//if there is no interent connection and user is trying to submit
//a transaction, it will keep a record of the transaction and will post
//to db once connection is restored
function saveRecord (data){
    var transaction = db.transaction(['budget-tracker'],'readwrite');
    var transObj = transaction.objectStore('budget-tracker');
    transObj.add(data)
}
//waiting for app to be connected to internet again
$(window).on('online', saveTrans)
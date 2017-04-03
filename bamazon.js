var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Shellie01",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('connection successful!');
  makeTable();
});

//Grab Product Table from Database + Print to console
var makeTable = function() {

  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;

    var tab = "\t";
    console.log("ItemID\tProduct Name\tDepartment Name\tPrice\t# In Stock");
    console.log("--------------------------------------------------------");

    //For Loop
    for (var i = 0; i < res.length; i++) {
      console.log(res[i].item_id + tab + res[i].product_name + tab +
        res[i].department_name + tab + res[i].price + tab + res[i].stock_quantity);
    }
    console.log("--------------------------------------------------------");

    
    promptCustomer(res);
  });
};

// Customer Prompt
var promptCustomer = function(res) {

  // Prompts user for what they would like to purchase
  inquirer.prompt([{
    type: "input",
    name: "choice",
    message: "What would you like to purchase? (Type 'Exit' to exit)"
  }]).then(function(val) {

    // Set the var correct to false so as to make sure the user inputs a valid product name
    var correct = false;

    // Check mySQL to see if product exists
    for (var i = 0; i < res.length; i++) {

      //If exists, save the data within product and id variables
      if (res[i].product_name === val.choice) {
        correct = true;
        var product = val.choice;
        var id = i;

        //Prompts the user to see how many of the product they would like to buy
        inquirer.prompt([{
          type: "input",
          name: "quantity",
          message: "How many would you like to buy?"
        }]).then(function(val) {

          //Checks if amount requested is > 0 
          if ((res[id].stock_quantity - val.quantity) > 0) {

            //Removes the amount requested from the MySQL table
            connection.query(
              "UPDATE products SET stock_quantity='" + (res[id].stock_quantity - val.quantity) +
              "' WHERE product_name='" + product + "'",
              function(err, res2) {
                if (err) {
                  throw err;
                }

                console.log("Product has been purchased!");
                makeTable();
              });
          }

          //Restart prompt if amount requested > amount available
          else {
            console.log("Sorry! Not a valid selection");
            promptCustomer(res);
          }
        });
      }

      if (val.choice === "EXIT" || val.choice === "exit" || val.choice === "Exit") {
        process.exit();
      }
    }



    //Restart prompt if product doesn't exist
    if (i === res.length && correct === false) {
      console.log("Sorry! Not a valid selection");
      promptCustomer(res);
    }
  });
};
var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "employee_tracker",
});

connection.connect(function (err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    start();
});

async function start() {
    console.log("*********************");
    //runTime function
    let userchoice = await inquirer.prompt({
        type: "list",
        message: "what do you want to do?",
        name: "choice",
        choices: [
            "Add a department, role, or employee",
            "View a deplartment, role, or employee",
            "Update employee role",
            "exit",
        ],
    });
    if (userchoice.choice != "exit") {
        let type;
        if (userchoice.choice === "Add a department, role, or employee") {
            let newItem = {};
            type = await getType();
            if (type.role === "department") {
                newItem["role"] = "department";
                newItem["data"] = await addDept();
            } else if (type.role === "role") {
                newItem["role"] = "role";
                newItem["data"] = await addRole();
            } else if (type.role === "employee") {
                newItem["role"] = "employee";
                newItem["data"] = await addEmployee();
            } else {
                console.log("option does not exist");
            }
            // add newItem to db
        } else if (
            userchoice.choice === "View a deplartment, role, or employee"
        ) {
            type = await getType();
            console.log(type);
        } else if (userchoice.choice === "Update employee role") {
            //
        }
        // start();
    } else {
        connection.end();
    }
}

async function getType() {
    return await inquirer.prompt({
        type: "list",
        name: "role",
        choices: ["department", "role", "employee"],
    });
    // return type.role;
}

async function addDept() {
    return await inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the department you wish to add?",
            name: "name",
        },
    ]);
}

async function addRole() {
    return await inquirer.prompt([
        {
            type: "input",
            message: "What is the title of the role you wish to add?",
            name: "title",
        },
        {
            type: "number",
            message: "What is the salary of the role?",
            name: "salary",
        },
        {
            type: "list",
            message: "What department is it apart of?",
            name: "department",
            choices: ["dept1"],
        },
    ]);
}

async function addEmployee() {
    return await inquirer.prompt([
        {
            type: "input",
            message: "What is the first name of the employee you wish to add?",
            name: "first_name",
        },
        {
            type: "input",
            message: "What is the last name of the employee you wish to add?",
            name: "last_name",
        },
        {
            type: "input",
            message: "What their the role?",
            name: "role",
        },
        {
            type: "list",
            message: "Who is their manager?",
            name: "manager",
            choices: ["person1"],
        },
    ]);
}

// SQL commands

// C
function addItem() {
    connection.
}
// R
// U
// D

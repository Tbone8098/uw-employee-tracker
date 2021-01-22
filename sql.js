var mysql = require("mysql");
var inquirer = require("inquirer");
const { promisify } = require("util");
const { async } = require("rxjs");

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
    connection.queryPromise = promisify(connection.query);
    start();
});

var counter = 0;

async function start() {
    console.log("*********************");
    //runTime function
    await initQuestions(true);
}

async function initQuestions(cont) {
    if (counter < 0) {
        console.log("end connection");
        connection.end();
    } else if (!cont) {
        counter--;
        initQuestions(false);
    } else {
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
        if (userchoice.choice === "exit") {
            initQuestions(false);
        } else {
            counter++;
            console.log(counter);
            await furtherQuestions(userchoice);
        }
    }
}

async function furtherQuestions(userchoice) {
    if (userchoice.choice != "exit") {
        let type;
        if (userchoice.choice === "Add a department, role, or employee") {
            let newItem = {};
            type = await getType();

            if (type.role === "department") {
                newItem = await addDept();
                addDeptToDb(newItem);
            } else if (type.role === "role") {
                allDepts = await retreveDept();
                newItem = await addRole(allDepts);
                addroleToDb(newItem);
            } else if (type.role === "employee") {
                allRoles = await retreveRole();
                allEmployees = await retreveEmployee();
                newItem = await addEmployee(allRoles, allEmployees);
                addEmployeeToDb(newItem);
            } else {
                console.log("option does not exist");
            }
        } else if (
            userchoice.choice === "View a deplartment, role, or employee"
        ) {
            type = await getType();
            let data;
            if (type.role === "department") {
                data = await retreveDept();
                console.table(data);
            } else if (type.role === "role") {
                data = await retreveRole();
                console.table(data);
            } else if (type.role === "employee") {
                data = await retreveEmployee();
                console.table(data);
            } else {
                console.log("option does not exist");
            }
        } else if (userchoice.choice === "Update employee role") {
            //
        }
    } else if (userchoice.choice === "Update employee role") {
        // update employee
        let allEmployees = await retreveEmployee();
        let whichEmployee = await getEmployee(allEmployees);
    }
    initQuestions(true);
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

async function addRole(depts) {
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
            choices: depts.map((dept) => ({
                name: dept.name,
                value: dept.id,
            })),
        },
    ]);
}

async function addEmployee(roles, employees) {
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
            type: "list",
            message: "What their the role?",
            name: "role_id",
            choices: roles.map((role) => ({
                name: role.title,
                value: role.id,
            })),
        },
        {
            type: "list",
            message: "Who is their manager?",
            name: "manager_id",
            choices: employees.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            })),
        },
    ]);
}

async function getEmployee(employees) {
    inquirer.prompt([
        {
            type: "list",
            message: "which employee?",
            name: "employee",
            choices: employees.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            })),
        },
    ]);
}

// SQL commands

// C
function addDeptToDb(item) {
    connection.query(
        "INSERT INTO department SET ?",
        {
            name: item.name,
        },
        async (err) => {
            if (err) throw err;
            console.log("added new department to db");
            await retreveDept();
        }
    );
}
function addroleToDb(item) {
    connection.query(
        "INSERT INTO employee_role SET ?",
        {
            title: item.title,
            salary: item.salary,
            department_id: item.department_id,
        },
        async (err) => {
            if (err) throw err;
            console.log("added new role to db");
            await retreveRole();
        }
    );
}
function addEmployeeToDb(item) {
    console.log(item);
    connection.query(
        "INSERT INTO employee SET ?",
        {
            first_name: item.first_name,
            last_name: item.last_name,
            role_id: item.role_id,
            manager_id: item.manager_id,
        },
        async (err) => {
            if (err) throw err;
            console.log("added new Employee to db");
            await retreveEmployee();
        }
    );
}
// R
async function retreveDept() {
    return await connection.queryPromise("SELECT * FROM department");
}
async function retreveRole() {
    return await connection.queryPromise("SELECT * FROM employee_role");
}
async function retreveEmployee() {
    return await connection.queryPromise("SELECT * FROM employee");
}
// U
// async function updateEmployee(employee_id){
//     connection.query("UPDATE employee set ?")
// }
// D

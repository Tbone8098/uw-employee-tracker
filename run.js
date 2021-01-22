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
            // update employee
            let allEmployees = await retreveEmployee();
            let whichEmployee = await getEmployee(allEmployees);
            let userData = await changeEmployeeInfo(whichEmployee);
            await updateEmployee(userData);
        }
    }
    initQuestions(true);
}

async function getType() {
    return await inquirer.prompt({
        type: "list",
        name: "role",
        choices: ["department", "role", "employee"],
    });
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
    // console.log("**********************!!!");
    // console.log(depts);
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
    let employee = await inquirer.prompt([
        {
            type: "list",
            message: "which employee?",
            name: "id",
            choices: employees.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            })),
        },
    ]);
    return employee.id;
}

async function changeEmployeeInfo(employee_id) {
    let newUserData = {};
    newUserData["id"] = employee_id;

    // change first name
    let confirmFirstName = await inquirer.prompt({
        type: "confirm",
        message: "Do you want to change the first name?",
        name: "changeFirstName",
    });

    if (confirmFirstName.changeFirstName) {
        let changeFirstName = await inquirer.prompt({
            type: "input",
            message: "What is their new first name?",
            name: "newFirstName",
        });
        newUserData["first_name"] = changeFirstName.newFirstName;
    }

    // change last name
    let confirmLastName = await inquirer.prompt({
        type: "confirm",
        message: "Do you want to change the last name?",
        name: "changeLastName",
    });

    if (confirmLastName.changeLastName) {
        let changeLastName = await inquirer.prompt({
            type: "input",
            message: "What is their new last name?",
            name: "newLastName",
        });
        newUserData["last_name"] = changeLastName.newLastName;
    }

    // change role
    let confirmRole = await inquirer.prompt({
        type: "confirm",
        message: "Do you want to change their role?",
        name: "changeRole",
    });

    if (confirmRole.changeRole) {
        let allRoles = await retreveRole();
        let changeRole = await inquirer.prompt({
            type: "list",
            message: "What is their new role?",
            name: "newRole",
            choices: allRoles.map((role) => ({
                name: role.title,
                value: role.id,
            })),
        });
        newUserData["role_id"] = changeRole.newRole;
    }

    // change manager
    let confirmManager = await inquirer.prompt({
        type: "confirm",
        message: "Do you want to change their manager?",
        name: "changeManager",
    });

    if (confirmManager.changeManager) {
        allEmployees = await retreveEmployee();
        let changeManager = await inquirer.prompt({
            type: "list",
            message: "who is their new manager?",
            name: "newManager",
            choices: allEmployees.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            })),
        });
        newUserData["manager_id"] = changeManager.newManager;
    }
    return newUserData;
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
    console.log("***************************");
    console.log(item);
    connection.query(
        "INSERT INTO employee_role SET ?",
        {
            title: item.title,
            salary: item.salary,
            department_id: item.department,
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
async function updateEmployee(employeeData) {
    console.log("*****************!!");
    console.log(employeeData);
    let employee_id = employeeData.id;
    delete employeeData.id;

    let employeeDataKeys = Object.keys(employeeData);
    console.log(employeeDataKeys);

    let query = "UPDATE employee set ";

    employeeDataKeys.forEach((key, i) => {
        if (i + 1 === employeeDataKeys.length) {
            query += `${key} = "${employeeData[key]}" `;
        } else {
            query += `${key} = "${employeeData[key]}", `;
        }
    });

    query += `where id = ${employee_id}`;

    console.log(query);

    connection.query(query, (err, res) => {
        if (err) throw err;
        console.log("it has been updated");
    });
}
// D

const bcrypt = require("bcrypt");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the password to hash: ", function (password) {
  bcrypt.hash(password, 10).then((hash) => {
    console.log("\nYour bcrypt hash:");
    console.log(hash);
    rl.close();
  });
});
